"""
Quick-Commerce Non-Tech Guide & How-To Manual PDF Generator (Visual Edition)
===========================================================================
Generates a publication-grade, visual handbook featuring:
- Non-Tech Order Journey Flowchart (Step 1 to Step 4)
- 4-Tier Cloud Architecture Infographic
- Real Screenshots (Mobile App, Rider HUD, 3D Command Center, Geographic Coverage)
- Clickable Hyperlinks to GitHub, code files, and author profiles
"""

import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable, Image
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        if self._pageNumber > 1:
            # Header
            self.drawString(
                54, letter[1] - 34,
                "Quick-Commerce Made Simple • Non-Tech Visual Guide & How-To Handbook (v3.0.0)"
            )
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, letter[1] - 40, letter[0] - 54, letter[1] - 40)

            # Footer
            self.setFont("Helvetica", 8)
            footer_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(letter[0] - 54, 30, footer_text)
            self.drawString(
                54, 30,
                "Engineered by Neel Belsare & Mansi Gaike • Open-Source on GitHub: github.com/NeelBelsare/my-dark-store-app"
            )
            self.line(54, 42, letter[0] - 54, 42)

        self.restoreState()


def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Color Palette
    PRIMARY = colors.HexColor("#4338CA")     # Royal Indigo
    SECONDARY = colors.HexColor("#8B82F6")   # Lavender / Periwinkle
    SLATE_DARK = colors.HexColor("#0F172A")  # Deep Slate
    SLATE_LIGHT = colors.HexColor("#F8FAFC") # Soft Off-White
    BORDER_COLOR = colors.HexColor("#E2E8F0")
    TEXT_MAIN = colors.HexColor("#1E293B")
    TEXT_MUTED = colors.HexColor("#64748B")
    LINK_COLOR = colors.HexColor("#0A66C2")  # LinkedIn / Action Blue

    # Custom Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=SLATE_DARK,
        spaceAfter=4
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=PRIMARY,
        spaceBefore=10,
        spaceAfter=5
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=SLATE_DARK,
        spaceBefore=7,
        spaceAfter=3
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_MAIN,
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.8,
        leading=12.5,
        textColor=TEXT_MAIN,
        leftIndent=14,
        firstLineIndent=-9,
        spaceAfter=3
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#1E1B4B")
    )

    caption_style = ParagraphStyle(
        'Caption_Style',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=TEXT_MUTED,
        alignment=1, # Center
        spaceBefore=3,
        spaceAfter=6
    )

    story = []

    # ==========================================
    # PAGE 1: COVER, EXECUTIVE SUMMARY & JOURNEY FLOWCHART
    # ==========================================
    banner_data = [
        [
            Paragraph("<b>QUICK-COMMERCE MADE SIMPLE</b><br/><font size='9.5' color='#4338CA'>Visual Non-Tech Handbook & How-To Guide (v3.0.0)</font>", title_style),
            Paragraph("<b>Stack:</b> React Native • FastAPI • Supabase<br/><b>Live Repo:</b> <font color='#0A66C2'><u><a href='https://github.com/NeelBelsare/my-dark-store-app'>github.com/NeelBelsare</a></u></font><br/><b>Delivery SLA:</b> Sub-12 Min Guaranteed", ParagraphStyle('Meta', parent=body_style, fontSize=8, leading=11, textColor=TEXT_MUTED))
        ]
    ]
    banner_table = Table(banner_data, colWidths=[330, 174])
    banner_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(banner_table)
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceBefore=2, spaceAfter=8))

    # Executive Overview Box
    exec_summary = (
        "<b>Welcome!</b> You don't need any programming or mathematical background to understand this project. "
        "This visual manual explains how 10-minute grocery delivery apps (like Blinkit, Zepto, and Instamart) actually operate, "
        "how our system was engineered to deliver across Chhatrapati Sambhajinagar (Aurangabad), and provides an easy 4-step walkthrough "
        "with clickable links and screenshots so you can test everything yourself."
    )
    callout_data = [[Paragraph(exec_summary, callout_style)]]
    callout_table = Table(callout_data, colWidths=[504])
    callout_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EEF2FF")),
        ('BOX', (0,0), (-1,-1), 1, SECONDARY),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(callout_table)
    story.append(Spacer(1, 8))

    # Flowchart 1: 10-Minute Order Journey
    journey_img = 'docs/screenshots/non_tech_order_journey.png'
    if os.path.exists(journey_img):
        story.append(Paragraph("<b>Visual Flowchart: The 10-Minute Order Lifecycle</b>", h2_style))
        story.append(Image(journey_img, width=504, height=201.6))
        story.append(Paragraph("<b>Flowchart 1:</b> The 4-step journey of an order — from the instant you tap 'Order' on your phone to delivery at your doorstep.", caption_style))

    story.append(Paragraph(
        "<b>What is a 'Dark Store'? (It's not spooky!):</b> Traditional supermarkets take days because giant warehouses are 50 km outside the city. "
        "Quick-Commerce places compact mini-warehouses directly inside residential neighborhoods. They have <b>no walk-in shoppers, glass display windows, or long cashier queues</b>. "
        "Because only trained pickers are inside, your grocery bag is packed in <b>under 120 seconds</b> and handed to a waiting bike courier!",
        body_style
    ))

    story.append(PageBreak())

    # ==========================================
    # PAGE 2: 4-TIER ARCHITECTURE & MOBILE APP SCREENSHOTS
    # ==========================================
    story.append(Paragraph("1. The 4 System Pillars & Cloud Architecture", h1_style))
    story.append(Paragraph(
        "Our platform connects four powerful tiers in real time. Click any link below to inspect the actual code on GitHub:",
        body_style
    ))

    # Pillars Table with Links
    pillars_data = [
        [
            Paragraph("<b>Tier</b>", ParagraphStyle('Th1', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph("<b>Everyday Analogy</b>", ParagraphStyle('Th2', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph("<b>What It Does & GitHub Link</b>", ParagraphStyle('Th3', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white))
        ],
        [
            Paragraph("<b>1. Mobile App</b><br/><font size='7.5' color='#64748B'>React Native Expo</font>", body_style),
            Paragraph("Storefront & Bike Screen", body_style),
            Paragraph("Browse groceries, see live bills, and place orders. Switch to 'Rider Mode' for street navigation.<br/>🔗 <font color='#0A66C2'><u><a href='https://github.com/NeelBelsare/my-dark-store-app/tree/main/mobile-app'>View mobile-app/ code</a></u></font>", body_style)
        ],
        [
            Paragraph("<b>2. Dispatch Engine</b><br/><font size='7.5' color='#64748B'>FastAPI Backend</font>", body_style),
            Paragraph("Traffic Police & Matchmaker", body_style),
            Paragraph("Finds the closest dark store, assigns couriers, and calculates weather/traffic buffers.<br/>🔗 <font color='#0A66C2'><u><a href='https://github.com/NeelBelsare/my-dark-store-app/blob/main/api.py'>View api.py backend</a></u></font>", body_style)
        ],
        [
            Paragraph("<b>3. Cloud Memory</b><br/><font size='7.5' color='#64748B'>Supabase PostgreSQL</font>", body_style),
            Paragraph("Master Ledger & Counter", body_style),
            Paragraph("Tracks real-time stock levels, store locations, and active orders via WebSockets.<br/>🔗 <font color='#0A66C2'><u><a href='https://github.com/NeelBelsare/my-dark-store-app#supabase-schema'>View Database Schema</a></u></font>", body_style)
        ],
        [
            Paragraph("<b>4. Control Tower</b><br/><font size='7.5' color='#64748B'>Streamlit Dashboard</font>", body_style),
            Paragraph("Airport Control Tower", body_style),
            Paragraph("Visual screen for managers: 3D flight arcs, moving couriers, and 1-click restock.<br/>🔗 <font color='#0A66C2'><u><a href='https://github.com/NeelBelsare/my-dark-store-app/blob/main/app.py'>View app.py dashboard</a></u></font>", body_style)
        ]
    ]
    pillars_table = Table(pillars_data, colWidths=[110, 120, 274])
    pillars_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, SLATE_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(pillars_table)
    story.append(Spacer(1, 8))

    # Architecture Flowchart Embed
    arch_img = 'docs/screenshots/architecture_flowchart.png'
    if os.path.exists(arch_img):
        story.append(KeepTogether([
            Image(arch_img, width=504, height=270),
            Paragraph("<b>Figure 1:</b> System Architecture Diagram — Showing how customer phones, cloud databases, and manager dashboards connect seamlessly.", caption_style)
        ]))

    story.append(PageBreak())

    # ==========================================
    # PAGE 3: VISUAL SCREENSHOTS SHOWCASE
    # ==========================================
    story.append(Paragraph("2. Visual Walkthrough & Real Application Screenshots", h1_style))
    story.append(Paragraph(
        "Here are actual screenshots taken directly from the running applications:",
        body_style
    ))

    # 2-Column Screenshots: Mobile App & Dark Store Network
    screen_mobile = 'docs/screenshots/01_mobile_app_live_dispatch.png'
    screen_map = 'docs/screenshots/04_dark_store_network_geospatial.png'
    if os.path.exists(screen_mobile) and os.path.exists(screen_map):
        img_row1 = [
            [
                Image(screen_mobile, width=160, height=210),
                Image(screen_map, width=330, height=210)
            ],
            [
                Paragraph("<b>Mobile App:</b> Checkout & Rider Partner Road HUD.<br/>🔗 <font color='#0A66C2'><u><a href='https://github.com/NeelBelsare/my-dark-store-app/tree/main/mobile-app'>Explore Mobile App Code</a></u></font>", caption_style),
                Paragraph("<b>12 Dark Stores:</b> City Coverage Zones in Aurangabad.<br/>🔗 <font color='#0A66C2'><u><a href='https://github.com/NeelBelsare/my-dark-store-app#dark-store-locations'>See 12 Hub Locations</a></u></font>", caption_style)
            ]
        ]
        t1 = Table(img_row1, colWidths=[170, 334])
        t1.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ]))
        story.append(t1)
        story.append(Spacer(1, 6))

    # 2-Column Screenshots: 3D Command Center & KPI Analytics
    screen_3d = 'docs/screenshots/02_command_center_telemetry.png'
    screen_kpi = 'docs/screenshots/03_command_center_kpis_filters.png'
    if os.path.exists(screen_3d) and os.path.exists(screen_kpi):
        img_row2 = [
            [
                Image(screen_3d, width=250, height=160),
                Image(screen_kpi, width=244, height=160)
            ],
            [
                Paragraph("<b>3D Flight Telemetry:</b> Live in-transit rider arcs.<br/>🔗 <font color='#0A66C2'><u><a href='https://github.com/NeelBelsare/my-dark-store-app#3d-telemetry'>PyDeck 3D Features</a></u></font>", caption_style),
                Paragraph("<b>KPIs & Economics:</b> Profits, SLAs, and order volume.<br/>🔗 <font color='#0A66C2'><u><a href='https://github.com/NeelBelsare/my-dark-store-app#analytics'>Analytics Engine</a></u></font>", caption_style)
            ]
        ]
        t2 = Table(img_row2, colWidths=[252, 252])
        t2.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ]))
        story.append(t2)

    story.append(PageBreak())

    # ==========================================
    # PAGE 4: 4-STEP HOW TO USE & TEST GUIDE
    # ==========================================
    story.append(Paragraph("3. Step-by-Step Guide: How to Test the Project", h1_style))
    story.append(Paragraph(
        "You can run and test every component locally or through Docker in 4 easy steps:",
        body_style
    ))

    # Quick Start Code Callout
    quick_box = [
        [
            Paragraph("<b>Quick Start (For Anyone with Terminal or Docker):</b>", h2_style)
        ],
        [
            Paragraph(
                "• <b>Option A (Easiest - 1 Command via Docker):</b> Run <code>docker compose up</code> in your terminal.<br/>"
                "• <b>Option B (Standard):</b> Run <code>streamlit run app.py</code> to launch the Manager Control Tower.<br/>"
                "• <b>Option C (Mobile App):</b> Open <code>mobile-app/</code> and run <code>npx expo start</code> to test on iOS, Android, or web browser.<br/>"
                "🔗 <b>Full Setup Guide:</b> <font color='#0A66C2'><u><a href='https://github.com/NeelBelsare/my-dark-store-app#quick-start'>https://github.com/NeelBelsare/my-dark-store-app#quick-start</a></u></font>",
                body_style
            )
        ]
    ]
    quick_table = Table(quick_box, colWidths=[504])
    quick_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(quick_table)
    story.append(Spacer(1, 8))

    # Step Breakdown
    steps_data = [
        ("Step 1: Open the Manager's Command Center (Browser)",
         "Open your web browser (Chrome/Safari) to <b>http://localhost:8501</b>. You will see the sleek Lavender & Dark Slate dashboard.<br/>"
         "• Click <b>'Live 3D Map'</b> to watch real-time flight arcs and courier markers.<br/>"
         "• Click <b>'Smart Inventory'</b> (Tab 7) to view live warehouse stock levels."),
        
        ("Step 2: Place an Order as a Customer (Mobile Screen)",
         "Open the mobile app or simulator screen.<br/>"
         "• Tap <b>'+'</b> on snacks or groceries (e.g. Potato Chips, Fresh Milk, Soda).<br/>"
         "• Review the instant bill summary with tax calculation and celebratory free-delivery progress bar.<br/>"
         "• Tap <b>'Place Order'</b> — within 0.1 seconds, celebratory confetti bursts and the order is locked!"),

        ("Step 3: Switch to 'Rider Partner Mode' (Experience the Delivery)",
         "Tap the <b>'Rider Mode'</b> button at the top of the mobile screen to see through the courier's eyes:<br/>"
         "• Follow the 4-stage stepper: <i>Accept Order ➔ Pick & Pack at Store ➔ Out for Delivery ➔ Delivered</i>.<br/>"
         "• Watch the live blue route map: it follows actual streets (Jalna Road, Kranti Chowk, CIDCO) and turns the bike icon as you move!"),

        ("Step 4: Watch the Inventory Automatically Drop",
         "Switch back to the Manager's Dashboard under <b>Tab 7: Smart Inventory</b>:<br/>"
         "• The item you ordered will decrease by exactly 1 unit in real time via cloud sync.<br/>"
         "• If an item drops below 10 units, a bright red <b>'LOW STOCK ALERT'</b> badge appears.<br/>"
         "• Tap the <b>'Auto-Replenish'</b> button to instantly balance inventory from a neighboring hub!")
    ]

    for title, desc in steps_data:
        box = [
            [Paragraph(f"<b>{title}</b>", ParagraphStyle('St1', parent=body_style, fontName='Helvetica-Bold', textColor=PRIMARY))],
            [Paragraph(desc, body_style)]
        ]
        st_table = Table(box, colWidths=[504])
        st_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.white),
            ('BOX', (0,0), (-1,-1), 0.6, BORDER_COLOR),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(st_table)
        story.append(Spacer(1, 5))

    story.append(PageBreak())

    # ==========================================
    # PAGE 5: PLAIN-ENGLISH FAQ & CLICKABLE CREDITS
    # ==========================================
    story.append(Paragraph("4. Frequently Asked Questions (FAQ for Non-Techies)", h1_style))

    faqs = [
        ("Q1: Why 12 mini-stores instead of 1 giant supermarket?",
         "Driving across Aurangabad takes 40+ minutes in heavy traffic. By opening 12 compact mini-stores across Cidco, Kranti Chowk, Jalna Road, and Waluj, no customer is ever more than 2.5 km away from a store!"),
        
        ("Q2: What happens if it rains heavily in Aurangabad?",
         "Delivery couriers should never have to drive dangerously fast. Our system automatically checks live weather and adds a 3-to-5 minute safety buffer to the estimated arrival time, keeping riders safe while keeping customers informed."),
        
        ("Q3: How do warehouse workers find items so quickly?",
         "Inside regular stores, shoppers wander around aisles. In our dark stores, an intelligent 'S-Shape Picking Route' tells the worker the exact sequence of shelves to walk through, like walking in an 'S' curve, so they never backtrack."),
         
        ("Q4: Can this be used for other cities or products?",
         "Yes! The mapping engine is completely modular. You can enter coordinates for Pune, Nashik, or Mumbai, or use it for rapid medicines, fresh meats, or pet supplies in minutes.")
    ]

    for q, a in faqs:
        faq_box = [
            [Paragraph(f"<b>{q}</b>", ParagraphStyle('FaqQ', parent=body_style, fontName='Helvetica-Bold', textColor=PRIMARY))],
            [Paragraph(a, body_style)]
        ]
        t = Table(faq_box, colWidths=[504])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
            ('BOX', (0,0), (-1,-1), 0.8, colors.HexColor("#CBD5E1")),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(t)
        story.append(Spacer(1, 5))

    story.append(Spacer(1, 8))
    story.append(Paragraph("5. Interactive Links & Project Credits", h1_style))

    credits_data = [
        [
            Paragraph("<b>Core Author & Systems Lead:</b>", ParagraphStyle('C1', parent=body_style, fontName='Helvetica-Bold')),
            Paragraph("<b>Neel Belsare</b> • Full-Stack & Systems Engineer<br/>"
                      "📧 Email: <font color='#0A66C2'><u><a href='mailto:neelbelsare28@gmail.com'>neelbelsare28@gmail.com</a></u></font><br/>"
                      "🔗 LinkedIn: <font color='#0A66C2'><u><a href='https://www.linkedin.com/in/neel-belsare-719b9a314/'>linkedin.com/in/neel-belsare</a></u></font><br/>"
                      "🐙 GitHub: <font color='#0A66C2'><u><a href='https://github.com/NeelBelsare'>github.com/NeelBelsare</a></u></font>", body_style)
        ],
        [
            Paragraph("<b>Co-Author & Analytics Lead:</b>", ParagraphStyle('C2', parent=body_style, fontName='Helvetica-Bold')),
            Paragraph("<b>Mansi Gaike</b> • Data Science & Feasibility Analyst", body_style)
        ],
        [
            Paragraph("<b>Live Open-Source Repository:</b>", ParagraphStyle('C3', parent=body_style, fontName='Helvetica-Bold')),
            Paragraph("🔗 <font color='#0A66C2'><u><a href='https://github.com/NeelBelsare/my-dark-store-app'>https://github.com/NeelBelsare/my-dark-store-app</a></u></font><br/>"
                      "Tagged: <b>Version 3.0.0 Production Release</b>", body_style)
        ]
    ]
    credits_table = Table(credits_data, colWidths=[140, 364])
    credits_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EEF2FF")),
        ('GRID', (0,0), (-1,-1), 0.5, SECONDARY),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(credits_table)

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated Visual Non-Tech Guide PDF at: {filename}")


if __name__ == '__main__':
    output_path = 'docs/Quick_Commerce_Non_Tech_Guide.pdf'
    os.makedirs('docs', exist_ok=True)
    build_pdf(output_path)
