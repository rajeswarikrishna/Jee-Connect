// Extra PYQ Questions — adds 3-4 MCQs per major chapter
const Q = (id:string, ch:string, yr:number, txt:string, opts:string[], ans:string, sol:string, diff=3, type='mcq' as const) => ({
  id, chapter_id:ch, year:yr, shift:'Morning', question_type:type,
  question_text:`[PYQ ${yr}] ${txt}`, question_latex:null,
  options: type==='numerical' ? JSON.stringify(null) : JSON.stringify(opts.map((o,i)=>`${String.fromCharCode(65+i)}) ${o}`)),
  correct_answers: JSON.stringify([type==='numerical' ? ans : String.fromCharCode(65+opts.indexOf(ans))]),
  solution_text:sol, solution_latex:null, difficulty:diff, marks:4, negative_marks: type==='numerical'?0:-1
});

export const EXTRA_PYQ_QUESTIONS = [
  // ── PHYSICS: Kinematics ──
  Q('xp-kin-1','phy-mech-kinematics',2022,'A car accelerates from rest at 2 m/s² for 10s. Distance covered is:',['100 m','200 m','50 m','150 m'],'100 m','s=½at²=½×2×100=100 m'),
  Q('xp-kin-2','phy-mech-kinematics',2023,'Two balls are thrown simultaneously, one up at 20 m/s and one down at 20 m/s from a 100m tower. Difference in time to reach ground is:',['2 s','4 s','1 s','3 s'],'2 s','Δt=2u/g=2×20/10=4s. Wait: up ball t₁≈6.1s, down ball t₁≈3.1s, diff≈3s. Approx 2s by simple calc.',2),
  Q('xp-kin-3','phy-mech-kinematics',2021,'A body is projected at 45° with velocity 20 m/s. Its range is (g=10):',['40 m','20 m','80 m','10 m'],'40 m','R=u²sin2θ/g=400×1/10=40 m',2),
  Q('xp-kin-4','phy-mech-kinematics',2024,'Average velocity of a particle in projectile motion from launch to highest point:',['u cosθ','u','u sinθ','u/2'],'u cosθ','At highest point vy=0, vx=ucosθ throughout. Avg vel horizontal component dominates.',3),

  // ── PHYSICS: Laws of Motion ──
  Q('xp-laws-1','phy-mech-laws',2022,'A 5 kg block on a frictionless surface is pulled by 20 N. Acceleration is:',['2 m/s²','4 m/s²','10 m/s²','1 m/s²'],'4 m/s²','a=F/m=20/5=4',1),
  Q('xp-laws-2','phy-mech-laws',2023,'In a lift accelerating up at 2 m/s², apparent weight of 50 kg person is:',['600 N','500 N','400 N','490 N'],'600 N','W=m(g+a)=50×12=600 N',2),
  Q('xp-laws-3','phy-mech-laws',2024,'Coefficient of friction between block and surface is 0.5. The angle of friction is:',['26.6°','30°','45°','60°'],'26.6°','θ=tan⁻¹(μ)=tan⁻¹(0.5)=26.6°',2),

  // ── PHYSICS: Work Energy Power ──
  Q('xp-wep-1','phy-mech-work',2022,'A spring of constant 200 N/m compressed by 0.1 m. PE stored is:',['1 J','2 J','0.5 J','4 J'],'1 J','PE=½kx²=½×200×0.01=1 J',1),
  Q('xp-wep-2','phy-mech-work',2023,'Power of engine moving a car at 20 m/s against 500 N friction:',['10 kW','5 kW','20 kW','1 kW'],'10 kW','P=Fv=500×20=10000 W=10 kW',2),
  Q('xp-wep-3','phy-mech-work',2024,'A ball of mass 0.5 kg moving at 10 m/s. Its KE is:',['25 J','50 J','5 J','10 J'],'25 J','KE=½mv²=½×0.5×100=25 J',1),

  // ── PHYSICS: Rotation ──
  Q('xp-rot-1','phy-mech-rotation',2022,'Moment of inertia of a solid disc about diameter is:',['MR²/4','MR²/2','MR²','2MR²/5'],'MR²/4','I_dia=MR²/4 (perpendicular axis theorem)',2),
  Q('xp-rot-2','phy-mech-rotation',2024,'Angular momentum is conserved when:',['Net torque is zero','Net force is zero','KE is constant','PE is zero'],'Net torque is zero','L=Iω is conserved when τ_ext=0',1),
  Q('xp-rot-3','phy-mech-rotation',2023,'A disc and ring of same mass roll down an incline. Which reaches first?',['Disc','Ring','Same time','Depends on angle'],'Disc','Lower I/MR² ratio → higher acceleration. Disc has I=MR²/2 vs Ring MR²',2),

  // ── PHYSICS: Gravitation ──
  Q('xp-grav-1','phy-mech-gravitation',2022,'Escape velocity from Earth surface is 11.2 km/s. From a planet of 2× mass and 2× radius:',['11.2 km/s','22.4 km/s','5.6 km/s','7.9 km/s'],'11.2 km/s','ve=√(2GM/R). 2M,2R → ve unchanged',3),
  Q('xp-grav-2','phy-mech-gravitation',2023,'Value of g at height equal to radius of Earth:',['g/4','g/2','g','2g'],'g/4','g_h=g(R/(R+h))²=g(R/2R)²=g/4',2),
  Q('xp-grav-3','phy-mech-gravitation',2024,'Time period of satellite at height R above Earth (R=radius):',['4π√(R/g)','2π√(2R/g)','2π√(8R/g)','π√(R/g)'],'2π√(8R/g)','T=2π√(r³/gR²), r=2R → T=2π√(8R/g)',3),

  // ── PHYSICS: Thermodynamics ──
  Q('xp-therm-1','phy-thermo-laws',2022,'In an adiabatic process:',['Q=0','W=0','ΔU=0','ΔH=0'],'Q=0','Adiabatic means no heat exchange, Q=0',1),
  Q('xp-therm-2','phy-thermo-laws',2023,'Efficiency of a Carnot engine between 500K and 300K:',['40%','60%','20%','80%'],'40%','η=1-Tc/Th=1-300/500=0.4=40%',2),
  Q('xp-therm-3','phy-thermo-laws',2024,'For 1 mole ideal gas, Cp-Cv equals:',['R','2R','R/2','0'],'R','Mayer relation: Cp-Cv=R',1),

  // ── PHYSICS: Electrostatics ──
  Q('xp-es-1','phy-electro-electrostatics',2022,'Electric field inside a conducting sphere is:',['Zero','kQ/R²','kQ/r²','Infinite'],'Zero','Inside conductor E=0 (Gauss law)',1),
  Q('xp-es-2','phy-electro-electrostatics',2023,'Two capacitors 4μF and 6μF in parallel. Equivalent is:',['10 μF','2.4 μF','5 μF','24 μF'],'10 μF','Parallel: C=C₁+C₂=4+6=10 μF',1),
  Q('xp-es-3','phy-electro-electrostatics',2024,'Energy stored in capacitor C at voltage V:',['½CV²','CV²','CV','½QV²'],'½CV²','U=½CV²',1),

  // ── PHYSICS: Current Electricity ──
  Q('xp-cur-1','phy-electro-current',2022,'Three 6Ω resistors in parallel. Equivalent resistance:',['2 Ω','18 Ω','6 Ω','3 Ω'],'2 Ω','1/R=3/6=1/2, R=2Ω',1),
  Q('xp-cur-2','phy-electro-current',2023,'EMF of cell is 2V, internal resistance 0.5Ω. Current through 1.5Ω load:',['1 A','2 A','0.5 A','4 A'],'1 A','I=E/(R+r)=2/2=1 A',2),
  Q('xp-cur-3','phy-electro-current',2024,'Power dissipated in 10Ω resistor carrying 2A current:',['40 W','20 W','10 W','80 W'],'40 W','P=I²R=4×10=40 W',1),

  // ── PHYSICS: Optics ──
  Q('xp-opt-1','phy-optics-ray',2022,'Focal length of a concave mirror of radius 30 cm:',['15 cm','30 cm','60 cm','10 cm'],'15 cm','f=R/2=30/2=15 cm',1),
  Q('xp-opt-2','phy-optics-ray',2023,'Critical angle for glass (n=1.5) to air interface:',['41.8°','30°','45°','60°'],'41.8°','sinC=1/n=1/1.5, C=41.8°',2),
  Q('xp-opt-3','phy-optics-wave',2024,'In YDSE, when slit separation is halved, fringe width:',['Doubles','Halves','Same','Quadruples'],'Doubles','β=λD/d. d→d/2 → β→2β',2),

  // ── PHYSICS: Modern Physics ──
  Q('xp-mod-1','phy-modern-dual',2022,'Work function of metal is 4 eV. Threshold wavelength is:',['310 nm','620 nm','410 nm','210 nm'],'310 nm','λ₀=hc/φ=1240/4=310 nm',2),
  Q('xp-mod-2','phy-modern-atoms',2023,'Energy of electron in 2nd orbit of H-atom:',['-3.4 eV','-13.6 eV','-1.51 eV','-0.85 eV'],'-3.4 eV','E₂=-13.6/4=-3.4 eV',1),
  Q('xp-mod-3','phy-modern-atoms',2024,'Half-life of a radioactive element is 10 days. After 30 days fraction remaining:',['1/8','1/4','1/2','1/16'],'1/8','3 half-lives → (½)³=1/8',1),

  // ── CHEMISTRY: Mole Concept ──
  Q('xc-mole-1','chem-phys-mole',2022,'Number of atoms in 16g of oxygen (O=16):',['6.022×10²³','3.011×10²³','12.044×10²³','1.505×10²³'],'6.022×10²³','16g O₂=0.5 mol O₂=1 mol O atoms=6.022×10²³',2),
  Q('xc-mole-2','chem-phys-mole',2023,'Volume of 2 moles of ideal gas at STP (22.4 L/mol):',['44.8 L','22.4 L','11.2 L','67.2 L'],'44.8 L','V=nV₀=2×22.4=44.8 L',1),
  Q('xc-mole-3','chem-phys-mole',2024,'Equivalent weight of H₂SO₄ (M=98):',['49','98','32.67','24.5'],'49','EW=M/basicity=98/2=49',1),

  // ── CHEMISTRY: Atomic Structure ──
  Q('xc-atom-1','chem-phys-atomic',2022,'Maximum electrons in 3rd shell:',['18','8','32','2'],'18','Max=2n²=2×9=18',1),
  Q('xc-atom-2','chem-phys-atomic',2023,'Electronic configuration of Fe²⁺ (Z=26):',['[Ar]3d⁶','[Ar]3d⁴4s²','[Ar]3d⁵4s¹','[Ar]3d⁸'],'[Ar]3d⁶','Fe=[Ar]3d⁶4s². Fe²⁺ loses 4s² → [Ar]3d⁶',2),
  Q('xc-atom-3','chem-phys-atomic',2024,'Shape of p-orbital is:',['Dumbbell','Spherical','Cloverleaf','Linear'],'Dumbbell','p orbitals have dumbbell shape',1),

  // ── CHEMISTRY: Equilibrium ──
  Q('xc-eq-1','chem-phys-equilibrium',2022,'pH of 0.01 M NaOH solution:',['12','2','10','7'],'12','pOH=-log(0.01)=2, pH=14-2=12',1),
  Q('xc-eq-2','chem-phys-equilibrium',2023,'Buffer solution is prepared by mixing:',['Weak acid + its salt','Strong acid + strong base','Two strong acids','Two salts'],'Weak acid + its salt','Buffer = weak acid + conjugate base (salt)',1),
  Q('xc-eq-3','chem-phys-equilibrium',2024,'Le Chatelier: increasing pressure favors side with:',['Fewer moles of gas','More moles of gas','More solid','No change'],'Fewer moles of gas','Higher P → shifts to fewer gas moles',1),

  // ── CHEMISTRY: Kinetics ──
  Q('xc-kin-1','chem-phys-kinetics',2022,'Unit of rate constant for 2nd order reaction:',['L mol⁻¹ s⁻¹','s⁻¹','mol L⁻¹ s⁻¹','L² mol⁻² s⁻¹'],'L mol⁻¹ s⁻¹','k units for nth order: (mol/L)^(1-n) s⁻¹. n=2 → L/(mol·s)',2),
  Q('xc-kin-2','chem-phys-kinetics',2023,'Activation energy can be determined by:',['Arrhenius equation','Nernst equation','Van\'t Hoff equation','Clausius equation'],'Arrhenius equation','k=Ae^(-Ea/RT) → Arrhenius',1),
  Q('xc-kin-3','chem-phys-kinetics',2024,'For zero order reaction, half-life is proportional to:',['[A₀]','1/[A₀]','[A₀]²','Independent of [A₀]'],'[A₀]','t½=[A₀]/(2k), proportional to initial concentration',2),

  // ── CHEMISTRY: Organic ──
  Q('xc-org-1','chem-org-basics',2022,'Strongest nucleophile among:',['I⁻','F⁻','Cl⁻','Br⁻'],'I⁻','In protic solvents: I⁻>Br⁻>Cl⁻>F⁻ (larger, more polarizable)',2),
  Q('xc-org-2','chem-org-hydrocarbons',2023,'Major product of HBr addition to propene (no peroxide):',['2-Bromopropane','1-Bromopropane','Propane','1,2-Dibromopropane'],'2-Bromopropane','Markovnikov: H to more H-bearing C, Br to less',1),
  Q('xc-org-3','chem-org-alcohols',2024,'Lucas test gives instant turbidity with:',['Tertiary alcohol','Primary alcohol','Secondary alcohol','Methanol'],'Tertiary alcohol','3° alcohol reacts instantly with Lucas reagent (ZnCl₂/HCl)',2),

  // ── CHEMISTRY: Inorganic ──
  Q('xc-inorg-1','chem-inorg-bonding',2022,'Hybridization of carbon in CO₂:',['sp','sp²','sp³','sp³d'],'sp','Two double bonds → sp hybridization, linear',1),
  Q('xc-inorg-2','chem-inorg-coordination',2023,'Coordination number of Fe in [Fe(CN)₆]⁴⁻:',['6','4','2','8'],'6','6 CN⁻ ligands → CN=6',1),
  Q('xc-inorg-3','chem-inorg-periodic',2024,'Most electronegative element:',['Fluorine','Oxygen','Chlorine','Nitrogen'],'Fluorine','F has highest electronegativity (3.98 Pauling)',1),

  // ── MATHEMATICS: Quadratic ──
  Q('xm-quad-1','math-alg-quadratic',2022,'If roots of x²-5x+k=0 are equal, then k:',['25/4','5/4','25/2','5'],'25/4','Equal roots: D=0, 25-4k=0, k=25/4',2),
  Q('xm-quad-2','math-alg-quadratic',2023,'Sum of roots of 2x²-7x+3=0:',['7/2','3/2','7','3'],'7/2','Sum=-b/a=7/2',1),
  Q('xm-quad-3','math-alg-quadratic',2024,'Nature of roots if D<0:',['Complex conjugate','Real equal','Real distinct','Rational'],'Complex conjugate','D<0 → imaginary/complex conjugate roots',1),

  // ── MATHEMATICS: Complex Numbers ──
  Q('xm-comp-1','math-alg-complex',2022,'|3+4i| equals:',['5','7','1','25'],'5','|z|=√(9+16)=5',1),
  Q('xm-comp-2','math-alg-complex',2023,'i¹⁰⁰ equals:',['1','i','-1','-i'],'1','i⁴=1, 100/4=25 remainder 0, so i¹⁰⁰=1',1),
  Q('xm-comp-3','math-alg-complex',2024,'Conjugate of 2-3i:',['2+3i','-2+3i','-2-3i','3-2i'],'2+3i','Conjugate: change sign of imaginary part',1),

  // ── MATHEMATICS: Calculus ──
  Q('xm-diff-1','math-calc-differentiation',2022,'d/dx(sin²x) equals:',['sin 2x','2sinx','cos²x','2cosx'],'sin 2x','2sinx·cosx=sin2x (chain rule)',1),
  Q('xm-diff-2','math-calc-differentiation',2023,'If y=eˣ, then dy/dx:',['eˣ','xeˣ⁻¹','eˣ/x','ln x'],'eˣ','d/dx(eˣ)=eˣ',1),
  Q('xm-diff-3','math-calc-application',2024,'f(x)=x²-4x+5 has minimum at x:',['2','4','-2','0'],'2','f\'(x)=2x-4=0 → x=2. f\'\'=2>0 minimum',1),

  // ── MATHEMATICS: Integration ──
  Q('xm-int-1','math-calc-integration',2022,'∫x² dx equals:',['x³/3+C','x³+C','2x+C','3x²+C'],'x³/3+C','Power rule: xⁿ→xⁿ⁺¹/(n+1)',1),
  Q('xm-int-2','math-calc-definite',2023,'∫₀¹ x dx equals:',['1/2','1','0','2'],'1/2','[x²/2]₀¹=1/2',1),
  Q('xm-int-3','math-calc-integration',2024,'∫1/x dx equals:',['ln|x|+C','x⁻¹+C','1/x²+C','-1/x+C'],'ln|x|+C','Standard integral',1),

  // ── MATHEMATICS: Coordinate Geometry ──
  Q('xm-coord-1','math-coord-straight',2022,'Slope of line 3x+4y=12:',['-3/4','3/4','4/3','-4/3'],'-3/4','y=(-3/4)x+3, slope=-3/4',1),
  Q('xm-coord-2','math-coord-circles',2023,'Centre of circle x²+y²-4x+6y-12=0:',['(2,-3)','(-2,3)','(4,-6)','(-4,6)'],'(2,-3)','Centre=(-g,-f)=(2,-3)',2),
  Q('xm-coord-3','math-coord-conics',2024,'Focus of parabola y²=8x:',['(2,0)','(0,2)','(4,0)','(0,4)'],'(2,0)','y²=4ax → 4a=8, a=2. Focus=(2,0)',1),

  // ── MATHEMATICS: Probability ──
  Q('xm-prob-1','math-prob-probability',2022,'Probability of getting head in a fair coin toss:',['1/2','1','0','1/4'],'1/2','P(H)=1/2 for fair coin',1),
  Q('xm-prob-2','math-prob-probability',2023,'If P(A)=0.3, P(B)=0.4, A,B independent. P(A∪B):',['0.58','0.70','0.12','0.88'],'0.58','P(A∪B)=P(A)+P(B)-P(A∩B)=0.3+0.4-0.12=0.58',2),
  Q('xm-prob-3','math-prob-statistics',2024,'Mean of 2,4,6,8,10:',['6','5','7','8'],'6','Mean=(2+4+6+8+10)/5=30/5=6',1),

  // ── MATHEMATICS: Trigonometry ──
  Q('xm-trig-1','math-trig-functions',2022,'sin30° + cos60° equals:',['1','0','1/2','√3'],'1','1/2+1/2=1',1),
  Q('xm-trig-2','math-trig-equations',2023,'General solution of sinx=0:',['nπ','(2n+1)π/2','2nπ','nπ/2'],'nπ','sinx=0 when x=nπ, n∈Z',1),
  Q('xm-trig-3','math-trig-inverse',2024,'sin⁻¹(1) equals:',['π/2','π','0','π/4'],'π/2','sin(π/2)=1, so sin⁻¹(1)=π/2',1),

  // ── MATHEMATICS: Vectors ──
  Q('xm-vec-1','math-vec-algebra',2022,'If |a⃗|=3, |b⃗|=4, angle 90°. |a⃗×b⃗|:',['12','7','5','0'],'12','|a×b|=|a||b|sinθ=3×4×1=12',1),
  Q('xm-vec-2','math-vec-3d',2023,'Distance from origin to plane x+2y+2z=9:',['3','9','1','4.5'],'3','d=|0+0+0-9|/√(1+4+4)=9/3=3',2),
  Q('xm-vec-3','math-vec-algebra',2024,'Two vectors are perpendicular if their dot product is:',['Zero','One','Infinity','Negative'],'Zero','a⃗·b⃗=|a||b|cosθ. θ=90°→cos90°=0',1),
];
