// JEE Connect - Parent Dashboard Screen (Sprint 8)
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '@/src/constants/theme';
import { analyticsService, ParentDashboardData, SubjectBreakdown, ChapterPerformance } from '@/src/services/AnalyticsService';
import { useAppStore } from '@/src/store/appStore';
import { getDatabase } from '@/src/db/database';

export default function ParentDashboardScreen() {
    const cs = useColorScheme();
    const isDark = cs === 'dark';
    const theme = isDark ? Colors.dark : Colors.light;
    const { userName, userEmail, logout, isParent, isAuthenticated } = useAppStore();
    const router = useRouter();

    const [data, setData] = useState<ParentDashboardData | null>(null);
    const [subjectData, setSubjectData] = useState<SubjectBreakdown[]>([]);
    const [weakestAreas, setWeakestAreas] = useState<{ subject: string, topics: string[], isAllWeak: boolean }[]>([]);
    const [loading, setLoading] = useState(true);
    const [parentPhone, setParentPhone] = useState('');
    const [smsSetup, setSMSSetup] = useState(false);

    useEffect(() => { loadDashboard(); }, []);

    async function loadDashboard() {
        try {
            const d = await analyticsService.getParentDashboardData(userName, userEmail);
            setData(d);
            const subData = await analyticsService.getSubjectBreakdown(userEmail);
            setSubjectData(subData);
            
            const heatData = await analyticsService.getWeaknessHeatmap(userEmail);
            
            const subjectMap = new Map<string, { totalChapters: number, weakChapters: ChapterPerformance[] }>();
            
            heatData.forEach(h => {
                if (!subjectMap.has(h.subject_name)) {
                    subjectMap.set(h.subject_name, { totalChapters: 0, weakChapters: [] });
                }
                const sub = subjectMap.get(h.subject_name)!;
                sub.totalChapters++;
                
                // Chapter is considered weak if accuracy < 50% or unattempted
                if (h.accuracy < 50 || h.total_attempted === 0) {
                    sub.weakChapters.push(h);
                }
            });
            
            const weakAreas: { subject: string, topics: string[], isAllWeak: boolean }[] = [];
            
            subjectMap.forEach((data, subjectName) => {
                if (data.weakChapters.length > 0) {
                    // Sort so actual failed chapters (attempts > 0, acc low) come first
                    data.weakChapters.sort((a, b) => {
                        if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
                        return b.total_attempted - a.total_attempted;
                    });
                    
                    const isAllWeak = data.weakChapters.length === data.totalChapters;
                    
                    // Show up to 3 topics to avoid cluttering the card
                    const topics = data.weakChapters.slice(0, 3).map(c => c.chapter_name);
                    
                    weakAreas.push({
                        subject: subjectName,
                        topics: topics,
                        isAllWeak: isAllWeak
                    });
                }
            });
            
            setWeakestAreas(weakAreas);
            
            // Check for existing SMS settings
            const db = await getDatabase();
            const phoneSetting = await db.getFirstAsync<{ value: string }>('SELECT value FROM user_settings WHERE key = ?', ['parent_sms_phone']);
            if (phoneSetting?.value) {
                setParentPhone(phoneSetting.value);
                setSMSSetup(true);
            }
        } catch (e) { 
            console.log('[PARENT DB] Dashboard load error:', e); 
        } finally { 
            setLoading(false); 
        }
    }

    const getWeeklyData = () => {
        if (!data || !data.recent_scores.length || !data.joined_at) return [];
        const weeks: Record<number, { totalScore: number, totalMarks: number }> = {};
        
        // Use registration date as the start of Week 1
        const joinDate = new Date(data.joined_at);
        joinDate.setHours(0,0,0,0);
        const joinTime = joinDate.getTime();
        
        data.recent_scores.forEach(score => {
            const d = new Date(score.date);
            d.setHours(0,0,0,0);
            
            const diffTime = Math.max(0, d.getTime() - joinTime);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const weekIndex = Math.floor(diffDays / 7) + 1;
            
            if (!weeks[weekIndex]) weeks[weekIndex] = { totalScore: 0, totalMarks: 0 };
            weeks[weekIndex].totalScore += score.score;
            weeks[weekIndex].totalMarks += score.total;
        });

        const sortedWeekIndices = Object.keys(weeks).map(Number).sort((a, b) => a - b);
        
        return sortedWeekIndices.slice(-5).map(weekIdx => {
            const w = weeks[weekIdx];
            const accuracy = w.totalMarks > 0 ? Math.round((w.totalScore / w.totalMarks) * 100) : 0;
            // Calculate the actual date for this week's start
            const weekStartDate = new Date(joinTime + (weekIdx - 1) * 7 * 24 * 60 * 60 * 1000);
            const dateLabel = `${weekStartDate.getDate()} ${weekStartDate.toLocaleString('default', { month: 'short' })}`;
            return { label: dateLabel, accuracy };
        });
    };

    const weeklyData = getWeeklyData();

    async function handleSetupSMS() {
        if (!parentPhone.trim() || parentPhone.length < 10) {
            const msg = 'Please enter a valid 10-digit phone number.';
            if (Platform.OS === 'web') alert(msg);
            else Alert.alert('Invalid Number', msg);
            return;
        }

        const summary = await analyticsService.generateWeeklySummary(userName, userEmail);
        const sent = await analyticsService.sendParentSMSAlert(parentPhone, summary);

        if (sent) {
            setSMSSetup(true);
            
            // PERSIST SETTINGS FOR AUTOMATIC WEEKLY ALERTS
            try {
                const db = await getDatabase();
                await db.runAsync('INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)', ['parent_sms_phone', parentPhone.trim()]);
                await db.runAsync('INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)', ['parent_sms_active', 'true']);
                console.log('[PARENT DB] SMS Settings persisted for weekly alerts.');
            } catch (e) {
                console.error('[PARENT DB] Failed to save SMS settings:', e);
            }

            const joinDay = data ? ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date(data.joined_at).getDay()] : 'Sunday';
            const msg = `SMS Sent Successfully! Weekly alerts are now active every ${joinDay}. ✅`;
            if (Platform.OS === 'web') alert(msg);
            else Alert.alert('Success', msg);
        } else {
            const msg = 'Failed to send SMS. Please check your Twilio configuration.';
            if (Platform.OS === 'web') alert(msg);
            else Alert.alert('Error', msg);
        }
    }

    if (loading || !data) return (
        <View style={[styles.center, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
    );

    const moodEmoji = data.mood_average > 0.6 ? '😊' : data.mood_average > 0.3 ? '😐' : '😟';
    const moodText = data.mood_average > 0.6 ? 'Happy & Focused' : data.mood_average > 0.3 ? 'Moderate' : 'Needs Support';

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}
            contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Stack.Screen options={{ 
                title: 'Parent Dashboard',
                headerLeft: () => null, // Remove back button
                headerBackVisible: false // Ensure it's hidden on all platforms
            }} />

            {/* Parent Hero */}
            <View style={[styles.heroCard, { backgroundColor: '#10b981' }]}>
                <TouchableOpacity 
                    style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 }}
                    onPress={() => { logout(); router.replace('/auth'); }}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>🚪 Logout Parent</Text>
                </TouchableOpacity>
                <Text style={styles.heroEmoji}>👨‍👩‍👦</Text>
                <Text style={styles.heroTitle}>Parent Dashboard</Text>
                <Text style={styles.heroSub}>{data.student_name}'s Progress Report</Text>
                <Text style={styles.heroNote}>Simple icons. No jargon. Just your child's effort.</Text>
            </View>

            {/* Stats Grid - Icon Based for easy understanding */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>📋 At a Glance</Text>
            <View style={styles.statsGrid}>
                <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                    <Text style={{ fontSize: 36 }}>📝</Text>
                    <Text style={[styles.statNum, { color: Colors.primary }]}>{data.total_tests}</Text>
                    <Text style={[styles.statLbl, { color: theme.textSecondary }]}>Tests Taken</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                    <Text style={{ fontSize: 36 }}>⏰</Text>
                    <Text style={[styles.statNum, { color: Colors.info }]}>{data.total_study_hours}h</Text>
                    <Text style={[styles.statLbl, { color: theme.textSecondary }]}>Study Time</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                    <Text style={{ fontSize: 36 }}>🎯</Text>
                    <Text style={[styles.statNum, { color: Colors.success }]}>{data.overall_accuracy}%</Text>
                    <Text style={[styles.statLbl, { color: theme.textSecondary }]}>Accuracy</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                    <Text style={{ fontSize: 36 }}>🔥</Text>
                    <Text style={[styles.statNum, { color: Colors.warning }]}>{data.current_streak}</Text>
                    <Text style={[styles.statLbl, { color: theme.textSecondary }]}>Day Streak</Text>
                </View>
            </View>

            {/* Mood Indicator */}
            <View style={[styles.moodCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                <Text style={{ fontSize: 40 }}>{moodEmoji}</Text>
                <View style={{ marginLeft: 16, flex: 1 }}>
                    <Text style={[styles.moodTitle, { color: theme.text }]}>How they're feeling</Text>
                    <Text style={[styles.moodText, { color: theme.textSecondary }]}>{moodText}</Text>
                    <View style={[styles.moodBar, { backgroundColor: theme.border }]}>
                        <View style={[styles.moodFill, {
                            width: `${data.mood_average * 100}%`,
                            backgroundColor: data.mood_average > 0.6 ? Colors.success : data.mood_average > 0.3 ? Colors.warning : Colors.error,
                        }]} />
                    </View>
                </View>
            </View>

            {/* Subject Performance */}
            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: Spacing.md }]}>📈 Subject Performance</Text>
            <View style={[styles.graphCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                {/* Legends */}
                <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
                        <Text style={[styles.legendText, { color: theme.textSecondary }]}>Strong ({'>'}70%)</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
                        <Text style={[styles.legendText, { color: theme.textSecondary }]}>Moderate</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
                        <Text style={[styles.legendText, { color: theme.textSecondary }]}>Weak ({'<'}40%)</Text>
                    </View>
                </View>

                {subjectData.length > 0 ? (
                    <View>
                        {/* Y-axis + Bars area */}
                        <View style={{ flexDirection: 'row' }}>
                            {/* Y-axis labels */}
                            <View style={{ width: 32, height: 150, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 4 }}>
                                <Text style={{ fontSize: 10, color: theme.textMuted }}>100</Text>
                                <Text style={{ fontSize: 10, color: theme.textMuted }}>75</Text>
                                <Text style={{ fontSize: 10, color: theme.textMuted }}>50</Text>
                                <Text style={{ fontSize: 10, color: theme.textMuted }}>25</Text>
                                <Text style={{ fontSize: 10, color: theme.textMuted }}>0</Text>
                            </View>
                            {/* Bars container */}
                            <View style={{ flex: 1, height: 150, position: 'relative' }}>
                                {/* Gridlines */}
                                {[0, 25, 50, 75].map(pct => (
                                    <View key={pct} style={{ position: 'absolute', top: `${100 - pct}%`, left: 0, right: 0, height: 1, backgroundColor: theme.border, opacity: 0.4 }} />
                                ))}
                                {/* Bars row */}
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 16, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: theme.border }}>
                                    {subjectData.map((sub, i) => {
                                        const barColor = sub.accuracy > 70 ? Colors.success : sub.accuracy > 40 ? Colors.warning : Colors.error;
                                        return (
                                            <View key={i} style={{ alignItems: 'center', flex: 1, maxWidth: 80 }}>
                                                <Text style={{ fontSize: 11, fontWeight: '800', color: barColor, marginBottom: 3 }}>{sub.accuracy}%</Text>
                                                <View style={{ width: '70%', height: Math.max(4, (sub.accuracy / 100) * 140), backgroundColor: barColor, borderTopLeftRadius: 3, borderTopRightRadius: 3 }} />
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>
                        {/* X-axis labels */}
                        <View style={{ flexDirection: 'row', marginLeft: 32, justifyContent: 'center', gap: 16, paddingHorizontal: 12, marginTop: 6 }}>
                            {subjectData.map((sub, i) => (
                                <View key={i} style={{ alignItems: 'center', flex: 1, maxWidth: 80 }}>
                                    <Text style={{ fontSize: 18 }}>{sub.icon}</Text>
                                    <Text style={{ fontSize: 10, fontWeight: '700', color: theme.text, textAlign: 'center' }} numberOfLines={1}>{sub.subject}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <Text style={{ color: theme.textMuted, textAlign: 'center', padding: Spacing.md }}>No subject data available yet.</Text>
                )}
            </View>

            {/* Weekly Improvement Graph */}
            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: Spacing.md }]}>📈 Weekly Improvement</Text>
            <View style={[styles.graphCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                {weeklyData.length > 0 ? (
                    <View>
                        {/* Y-axis + Bars area */}
                        <View style={{ flexDirection: 'row' }}>
                            {/* Y-axis labels */}
                            <View style={{ width: 32, height: 150, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 4 }}>
                                <Text style={{ fontSize: 10, color: theme.textMuted }}>100</Text>
                                <Text style={{ fontSize: 10, color: theme.textMuted }}>75</Text>
                                <Text style={{ fontSize: 10, color: theme.textMuted }}>50</Text>
                                <Text style={{ fontSize: 10, color: theme.textMuted }}>25</Text>
                                <Text style={{ fontSize: 10, color: theme.textMuted }}>0</Text>
                            </View>
                            {/* Bars container */}
                            <View style={{ flex: 1, height: 150, position: 'relative' }}>
                                {/* Gridlines */}
                                {[0, 25, 50, 75].map(pct => (
                                    <View key={pct} style={{ position: 'absolute', top: `${100 - pct}%`, left: 0, right: 0, height: 1, backgroundColor: theme.border, opacity: 0.4 }} />
                                ))}
                                {/* Bars row */}
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 12, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: theme.border }}>
                                    {weeklyData.map((week, i) => {
                                        const barColor = Colors.primary;
                                        return (
                                            <View key={i} style={{ alignItems: 'center', flex: 1, maxWidth: 80 }}>
                                                <Text style={{ fontSize: 11, fontWeight: '800', color: barColor, marginBottom: 3 }}>{week.accuracy}%</Text>
                                                <View style={{ width: '70%', height: Math.max(4, (week.accuracy / 100) * 140), backgroundColor: barColor, borderTopLeftRadius: 3, borderTopRightRadius: 3 }} />
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>
                        {/* X-axis labels */}
                        <View style={{ flexDirection: 'row', marginLeft: 32, justifyContent: 'center', gap: 12, paddingHorizontal: 12, marginTop: 6 }}>
                            {weeklyData.map((week, i) => (
                                <View key={i} style={{ alignItems: 'center', flex: 1, maxWidth: 80 }}>
                                    <Text style={{ fontSize: 10, fontWeight: '700', color: theme.textSecondary, textAlign: 'center' }}>{week.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                        <Text style={{ fontSize: 32, marginBottom: 8 }}>📝</Text>
                        <Text style={[{ color: theme.textSecondary, fontSize: 13, textAlign: 'center' }]}>
                            No tests taken yet. Scores will appear here after the first mock test.
                        </Text>
                    </View>
                )}

                {/* Focus Suggestion */}
                {weakestAreas.length > 0 && (
                    <View style={[styles.suggestionCard, { backgroundColor: Colors.error + '10', borderColor: Colors.error + '30', marginTop: Spacing.lg }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <Text style={{ fontSize: 24, marginRight: 8 }}>🎯</Text>
                            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700', flex: 1 }}>Focus Areas Needed</Text>
                        </View>
                        
                        {weakestAreas.map((weak, i) => (
                            <View key={i} style={{ marginBottom: 12 }}>
                                <Text style={{ color: theme.text, fontSize: 14, lineHeight: 22 }}>
                                    {data?.student_name} is currently struggling with <Text style={{ fontWeight: '700', color: Colors.error }}>
                                        {weak.isAllWeak ? weak.subject : weak.topics.join(', ')}
                                    </Text>
                                    {!weak.isAllWeak ? ` in ${weak.subject}` : ''}.
                                </Text>
                            </View>
                        ))}
                        
                        <Text style={{ color: theme.text, fontSize: 14, marginTop: 8 }}>
                            💡 <Text style={{ fontWeight: '600' }}>Parent Tip:</Text> Encourage them to review the Key Concepts for these topics before taking another test.
                        </Text>
                    </View>
                )}
            </View>

            {/* SMS Setup */}
            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: Spacing.md }]}>📱 Weekly SMS Alerts</Text>
            <View style={[styles.smsCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                <Text style={[{ color: theme.text, fontSize: 14, marginBottom: 8 }]}>
                    Get weekly progress reports via SMS — even without a smartphone!
                </Text>
                <TextInput
                    style={[styles.phoneInput, { borderColor: theme.border, color: theme.text, backgroundColor: isDark ? '#1a1a2e' : '#f8f9fa' }]}
                    value={parentPhone} onChangeText={setParentPhone}
                    placeholder="Enter parent's phone number"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="phone-pad" maxLength={10}
                />
                <TouchableOpacity style={[styles.smsBtn, { backgroundColor: smsSetup ? Colors.success : Colors.primary }]}
                    onPress={handleSetupSMS} activeOpacity={0.7}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>
                        {smsSetup ? '✅ SMS Alerts Active' : '📲 Activate Weekly Alerts'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={[styles.infoCard, { backgroundColor: Colors.info + '10', borderColor: Colors.info + '30' }]}>
                <Text style={[{ color: Colors.info, fontWeight: '700', marginBottom: 4 }]}>ℹ️ About This Dashboard</Text>
                <Text style={[{ color: theme.textSecondary, fontSize: 13, lineHeight: 20 }]}>
                    This dashboard is designed for parents who may not be tech-savvy. All data is shown using simple icons and large numbers. SMS alerts work on basic phones too!
                </Text>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: Spacing.md },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    heroCard: { borderRadius: BorderRadius.lg, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg, ...Shadow.lg },
    heroEmoji: { fontSize: 48, marginBottom: 8 },
    heroTitle: { color: '#fff', fontSize: FontSize.xl, fontWeight: '800' },
    heroSub: { color: 'rgba(255,255,255,0.9)', fontSize: FontSize.md, fontWeight: '600', marginTop: 4 },
    heroNote: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm, marginTop: 8, textAlign: 'center' },
    sectionTitle: { fontSize: FontSize.md, fontWeight: '700', marginBottom: Spacing.sm },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
    statBox: { flex: 1, minWidth: '45%', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1, ...Shadow.sm },
    statNum: { fontSize: FontSize.xxl, fontWeight: '800', marginTop: 4 },
    statLbl: { fontSize: FontSize.xs, fontWeight: '600', marginTop: 2 },
    moodCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.lg, ...Shadow.sm },
    moodTitle: { fontSize: FontSize.base, fontWeight: '700' },
    moodText: { fontSize: FontSize.sm, marginTop: 2, marginBottom: 8 },
    moodBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
    moodFill: { height: '100%', borderRadius: 3 },
    scoreRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.sm, borderRadius: BorderRadius.sm, borderWidth: 1, marginBottom: 4, gap: 8 },
    scoreBar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
    scoreFill: { height: '100%', borderRadius: 4 },
    emptyBox: { alignItems: 'center', padding: Spacing.xl, borderRadius: BorderRadius.lg, borderWidth: 1 },
    smsCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.md },
    phoneInput: { borderWidth: 1.5, borderRadius: BorderRadius.md, padding: 14, fontSize: 16, fontWeight: '600', marginBottom: 12 },
    smsBtn: { paddingVertical: 14, borderRadius: BorderRadius.md, alignItems: 'center' },
    infoCard: { padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1 },
    
    // Vertical Graph styles
    graphCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.md },
    legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: FontSize.xs, fontWeight: '600' },
    verticalChartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 180, paddingBottom: 10 },
    verticalBarCol: { alignItems: 'center', width: 60 },
    verticalBarVal: { fontSize: FontSize.sm, fontWeight: '800', marginBottom: 4 },
    verticalBarBg: { width: 32, height: 120, borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' },
    verticalBarFill: { width: '100%', borderTopLeftRadius: 4, borderTopRightRadius: 4, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
    verticalBarLbl: { fontSize: FontSize.xs, fontWeight: '700', marginTop: 4, textAlign: 'center' },
    
    suggestionCard: { padding: Spacing.lg, borderRadius: BorderRadius.md, borderWidth: 1 },
});
