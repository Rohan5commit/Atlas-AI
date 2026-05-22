from fpdf import FPDF
import os

class PitchDeck(FPDF):
    def header(self):
        pass
    
    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Atlas AI Pitch Deck - Page {self.page_no()}", 0, 0, "C")

def create_deck():
    pdf = PitchDeck(orientation="landscape", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # Define colors
    bg_color = (15, 23, 42)  # Dark slate
    text_color = (255, 255, 255)
    accent_color = (59, 130, 246)  # Blue
    
    ss_dir = "/Users/rohan/Desktop"
    ss_files = sorted([f for f in os.listdir(ss_dir) if f.startswith("Screenshot") and f.endswith(".png")])
    
    # Page 1: Title
    pdf.add_page()
    pdf.set_fill_color(*bg_color)
    pdf.rect(0, 0, 297, 210, "F")
    
    pdf.set_font("Helvetica", "B", 48)
    pdf.set_text_color(*text_color)
    pdf.set_y(80)
    pdf.cell(0, 20, "ATLAS AI", 0, 1, "C")
    
    pdf.set_font("Helvetica", "", 24)
    pdf.set_text_color(*accent_color)
    pdf.cell(0, 15, "Your Grounded Financial Copilot", 0, 1, "C")
    
    pdf.set_font("Helvetica", "I", 14)
    pdf.set_text_color(200, 200, 200)
    pdf.set_y(150)
    pdf.cell(0, 10, "Bridging the gap between daily spending and long-term wealth.", 0, 1, "C")

    # Page 2: The Problem
    pdf.add_page()
    pdf.rect(0, 0, 297, 210, "F")
    pdf.set_font("Helvetica", "B", 32)
    pdf.set_text_color(*accent_color)
    pdf.set_y(30)
    pdf.cell(0, 20, "The Problem", 0, 1, "L", False)
    
    pdf.set_font("Helvetica", "", 18)
    pdf.set_text_color(*text_color)
    pdf.set_x(20)
    problems = [
        "- Financial data is fragmented across banks and brokerages.",
        "- Most users have no real-time link between spending and portfolio risk.",
        "- AI assistants are often 'hallucinating' or generic, not grounded in data.",
        "- Beginners lack actionable, personalized scenario planning."
    ]
    pdf.set_y(60)
    for p in problems:
        pdf.multi_cell(0, 12, p, 0, "L")
        pdf.ln(5)

    # Page 3: The Solution
    pdf.add_page()
    pdf.rect(0, 0, 297, 210, "F")
    pdf.set_font("Helvetica", "B", 32)
    pdf.set_text_color(*accent_color)
    pdf.set_y(30)
    pdf.cell(0, 20, "The Solution: Atlas AI", 0, 1, "L")
    
    pdf.set_font("Helvetica", "", 18)
    pdf.set_text_color(*text_color)
    pdf.set_y(60)
    solutions = [
        "- One Coherent Flow: Upload bank CSVs to unlock deep insights.",
        "- Grounded Reasoning: Powered by NVIDIA NIM (Llama 3.1) for zero hallucination.",
        "- Actionable Intelligence: Real-time anomaly detection and health scoring.",
        "- Future-Proof: AI-driven scenario planning for goal achievement."
    ]
    for s in solutions:
        pdf.multi_cell(0, 12, s, 0, "L")
        pdf.ln(5)

    # Pages 4-8: Features with Screenshots
    features = [
        ("Dashboard Overview", "Centralized view of cashflow, net worth, and AI insights."),
        ("Spending Analytics", "Automated categorization and IQR-based anomaly detection."),
        ("Portfolio Intelligence", "Real-time volatility analysis and health scoring."),
        ("Predictive Forecasting", "Monte Carlo-inspired wealth projections grounded in behavior."),
        ("Ask Atlas", "Conversational interface for complex financial strategy.")
    ]
    
    for i in range(5):
        pdf.add_page()
        pdf.rect(0, 0, 297, 210, "F")
        
        title, desc = features[i]
        pdf.set_font("Helvetica", "B", 24)
        pdf.set_text_color(*accent_color)
        pdf.set_y(15)
        pdf.cell(0, 15, title, 0, 1, "L")
        
        pdf.set_font("Helvetica", "", 14)
        pdf.set_text_color(*text_color)
        pdf.multi_cell(0, 10, desc, 0, "L")
        
        if i < len(ss_files):
            ss_path = os.path.join(ss_dir, ss_files[i])
            # Calculate aspect ratio to fit
            # Max width 260, Max height 140
            pdf.image(ss_path, x=18.5, y=50, w=260)
            
    # Save outputs
    download_path = "/Users/rohan/Downloads/Atlas-AI-Pitch-Deck.pdf"
    repo_path = "/Users/rohan/Atlas-AI/docs/pitch-deck.pdf"
    
    pdf.output(download_path)
    pdf.output(repo_path)
    print(f"Deck created at {download_path} and {repo_path}")

if __name__ == "__main__":
    create_deck()
