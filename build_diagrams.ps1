# JEE Connect — Diagram Builder Script
# Compiles all Mermaid (.mmd) diagrams into PNG images
# Works on ANY developer's machine (uses dynamic desktop path)

$DesktopPath = Join-Path $env:USERPROFILE "Desktop\JEE_Connect_Diagrams"
New-Item -ItemType Directory -Force -Path $DesktopPath

Write-Host "📊 Building JEE Connect SE Diagrams..." -ForegroundColor Cyan
Write-Host "Output folder: $DesktopPath" -ForegroundColor Gray

# 1. Use Case Diagram
Write-Host "`n[1/7] Use Case Diagram..." -ForegroundColor Yellow
npx -y @mermaid-js/mermaid-cli -i use_case_diagram.mmd -o "$DesktopPath\1_Use_Case_Diagram.png"

# 2. System Architecture
Write-Host "[2/7] System Architecture..." -ForegroundColor Yellow
npx -y @mermaid-js/mermaid-cli -i system_architecture.mmd -o "$DesktopPath\2_System_Architecture.png"

# 3. Activity Diagram
Write-Host "[3/7] Activity Diagram..." -ForegroundColor Yellow
npx -y @mermaid-js/mermaid-cli -i activity_diagram.mmd -o "$DesktopPath\3_Activity_Diagram.png"

# 4. Sequence Diagram (NEW)
Write-Host "[4/7] Sequence Diagram..." -ForegroundColor Yellow
npx -y @mermaid-js/mermaid-cli -i sequence_diagram.mmd -o "$DesktopPath\4_Sequence_Diagram.png"

# 5. Database Schema / ER Diagram (NEW)
Write-Host "[5/7] Database Schema (ER Diagram)..." -ForegroundColor Yellow
npx -y @mermaid-js/mermaid-cli -i database_schema.mmd -o "$DesktopPath\5_Database_Schema.png"

# 6. State Transition Diagram (NEW)
Write-Host "[6/7] State Transition Diagram..." -ForegroundColor Yellow
npx -y @mermaid-js/mermaid-cli -i state_diagram.mmd -o "$DesktopPath\6_State_Diagram.png"

# 7. Class Diagram (NEW)
Write-Host "[7/8] Class Diagram..." -ForegroundColor Yellow
npx -y @mermaid-js/mermaid-cli -i class_diagram.mmd -o "$DesktopPath\7_Class_Diagram.png"

# 8. End-to-End System & Data Flow (NEW)
Write-Host "[8/8] End-to-End System & Data Flow Diagram..." -ForegroundColor Yellow
npx -y @mermaid-js/mermaid-cli -i end_to_end_flow.mmd -o "$DesktopPath\8_End_To_End_Flow.png"

Write-Host "`n✅ All 8 diagrams compiled successfully!" -ForegroundColor Green
Write-Host "📁 Open: $DesktopPath" -ForegroundColor Cyan
