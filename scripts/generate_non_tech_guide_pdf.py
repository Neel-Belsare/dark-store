"""
Quick-Commerce Non-Tech Guide & How-To Manual PDF Generator
===========================================================
Generates a beautifully formatted, highly accessible, beginner-friendly
PDF handbook explaining the Dark Store Feasibility & Dispatch Ecosystem (v3.0.0)
for non-technical stakeholders, recruiters, investors, and business leaders.
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
                "Quick-Commerce Made Simple • Non-Tech Guide & How-To Handbook (v3.0.0)"
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
                "Engineered by Neel Belsare & Mansi Gaike • Confidential & Educational Walkthrough"
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

    # Custom Color Palette
    PRIMARY = colors.HexColor("#4338CA")     # Royal Indigo
    SECONDARY = colors.HexColor("#8B82F6")   # Lavender / Periwinkle
    SLATE_DARK = colors.HexColor("#0F172A")  # Deep Slate
    SLATE_LIGHT = colors.HexColor("#F8FAFC") # Soft Off-White
    BORDER_COLOR = colors.HexColor("#E2E8F0")
    TEXT_MAIN = colors.HexColor("#1E293B")
    TEXT_MUTED = colors.HexColor("#64748B")
    SUCCESS = colors.HexColor("#10B981")

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=SLATE_DARK,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=PRIMARY,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=PRIMARY,
        spaceBefore=12,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=SLATE_DARK,
        spaceBefore=8,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=TEXT_MAIN,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_MAIN,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
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
        spaceAfter=8
    )

    story = []

    # ==========================================
    # COVER / HEADER BANNER
    # ==========================================
    banner_data = [
        [
            Paragraph("<b>QUICK-COMMERCE MADE SIMPLE</b><br/><font size='10' color='#4338CA'>A Complete Beginner & Non-Tech Guide (v3.0.0)</font>", title_style),
            Paragraph("<b>Status:</b> Production v3.0<br/><b>Location:</b> Aurangabad Hub<br/><b>Target:</b> Sub-12 Min Delivery", ParagraphStyle('Meta', parent=body_style, fontSize=8.5, leading=12, textColor=TEXT_MUTED))
        ]
    ]
    banner_table = Table(banner_data, colWidths=[350, 154])
    banner_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(banner_table)
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceBefore=4, spaceAfter=14))

    # Executive Overview Box
    exec_summary = (
        "<b>What is this document?</b> You do not need any coding or engineering background to understand this handbook. "
        "It explains in plain, everyday language how 10-minute grocery delivery apps (like Blinkit, Zepto, and Instamart) actually work, "
        "how our system was engineered to deliver across Chhatrapati Sambhajinagar, and a simple 4-step guide on how to test every screen yourself."
    )
    callout_data = [[Paragraph(exec_summary, callout_style)]]
    callout_table = Table(callout_data, colWidths=[504])
    callout_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EEF2FF")),
        ('BOX', (0,0), (-1,-1), 1, SECONDARY),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(callout_table)
    story.append(Spacer(1, 14))

    # ==========================================
    # CHAPTER 1: THE BIG PICTURE
    # ==========================================
    story.append(Paragraph("1. The Big Picture: How Does 10-Minute Delivery Work?", h1_style))
    story.append(Paragraph(
        "Imagine you are at home and suddenly run out of milk, or you want cold drinks for guests who just arrived. "
        "You open an app on your phone, tap order, and in less time than it takes to boil a cup of tea (under 10 to 12 minutes), "
        "a delivery rider rings your doorbell. <b>How is this physically possible?</b>",
        body_style
    ))
    story.append(Paragraph(
        "Traditional e-commerce (like Amazon) uses giant regional warehouses located 50 km away on highways, taking 2 to 3 days to deliver. "
        "Quick-Commerce turns this model upside down by using small, localized mini-warehouses called <b>Dark Stores</b>.",
        body_style
    ))

    # Dark Store Definition Card
    ds_explanation = [
        [
            Paragraph("<b>What is a 'Dark Store'? (It's not spooky!)</b>", h2_style),
        ],
        [
            Paragraph(
                "A <b>Dark Store</b> is a compact mini-warehouse (about the size of a large convenience store) tucked away inside residential neighborhoods. "
                "The word 'dark' simply means <b>it has no walk-in customers or glass display windows</b>. "
                "Only trained warehouse pickers and delivery riders are allowed inside. "
                "Because there are no queues, browsing shoppers, or cash registers, a worker can pick and pack your entire grocery bag in <b>less than 120 seconds</b>!",
                body_style
            )
        ]
    ]
    ds_table = Table(ds_explanation, colWidths=[504])
    ds_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(ds_table)
    story.append(Spacer(1, 12))

    # ==========================================
    # CHAPTER 2: THE 4 PILLARS OF OUR SYSTEM
    # ==========================================
    story.append(Paragraph("2. The 4 Key Parts of Our Project (Plain English)", h1_style))
    story.append(Paragraph("Our system connects four essential pieces together in real time:", body_style))

    pillars_data = [
        [
            Paragraph("<b>Part</b>", ParagraphStyle('Th1', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph("<b>Everyday Analogy</b>", ParagraphStyle('Th2', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph("<b>What It Does</b>", ParagraphStyle('Th3', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white))
        ],
        [
            Paragraph("<b>1. The Mobile App</b><br/><font size='8' color='#64748B'>React Native (Expo)</font>", body_style),
            Paragraph("The Storefront & Delivery Bike Screen", body_style),
            Paragraph("Customers browse snacks, see live bills, and order with 1 tap. Delivery partners switch to 'Rider Mode' to see turn-by-turn road navigation on city streets.", body_style)
        ],
        [
            Paragraph("<b>2. The Dispatch Brain</b><br/><font size='8' color='#64748B'>FastAPI Backend</font>", body_style),
            Paragraph("The Invisible Traffic Police & Matchmaker", body_style),
            Paragraph("Instantly checks which of the 12 Aurangabad dark stores has your items, finds the closest available delivery rider, and calculates the safest route avoiding monsoon traffic.", body_style)
        ],
        [
            Paragraph("<b>3. The Cloud Memory</b><br/><font size='8' color='#64748B'>Supabase Cloud</font>", body_style),
            Paragraph("The Master Ledger & Stock Counter", body_style),
            Paragraph("Instantly counts items as they leave shelves. If a store has only 3 packets of biscuits left, it alerts the manager before customers experience stockouts.", body_style)
        ],
        [
            Paragraph("<b>4. The Command Center</b><br/><font size='8' color='#64748B'>Streamlit Dashboard</font>", body_style),
            Paragraph("The Airport Control Tower", body_style),
            Paragraph("A visual dashboard for city managers showing 3D flight arcs, moving delivery riders, financial profits, delivery speed, and 1-click restock buttons.", body_style)
        ]
    ]
    pillars_table = Table(pillars_data, colWidths=[120, 134, 250])
    pillars_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, SLATE_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(pillars_table)
    story.append(Spacer(1, 14))

    # Architecture Visual Embed
    arch_img_path = 'docs/screenshots/architecture_flowchart.png'
    if os.path.exists(arch_img_path):
        story.append(KeepTogether([
            Image(arch_img_path, width=504, height=270),
            Paragraph("<b>Figure 1:</b> The 4-Tier Quick-Commerce Architecture — Showing how the phone app, cloud brain, and dashboard talk in real time.", caption_style)
        ]))

    story.append(PageBreak())

    # ==========================================
    # CHAPTER 3: STEP-BY-STEP USER GUIDE
    # ==========================================
    story.append(Paragraph("3. Step-by-Step Guide: How to Use & Test the System", h1_style))
    story.append(Paragraph(
        "Want to see the system in action? Follow these simple steps to place a test order, watch a rider navigate, and see the inventory update.",
        body_style
    ))

    # Step 1
    story.append(Paragraph("Step 1: Open the Manager's Control Tower (Dashboard)", h2_style))
    story.append(Paragraph(
        "Open your web browser (Chrome or Safari) to the dashboard. You will see a modern screen designed in soft lavender and dark slate:",
        body_style
    ))
    story.append(Paragraph("• <b>Overview Tab:</b> Shows key city stats — over 1.7 million reachable residents and an average delivery time of 13 minutes.", bullet_style))
    story.append(Paragraph("• <b>Live 3D Map Tab:</b> Displays a globe-style map of Aurangabad with green circular hubs and moving delivery riders.", bullet_style))
    story.append(Paragraph("• <b>Smart Inventory Tab:</b> Lists every product on the shelves (chips, milk, sodas, fruits) and how many units remain.", bullet_style))
    story.append(Spacer(1, 6))

    # Step 2
    story.append(Paragraph("Step 2: Place an Order as a Customer", h2_style))
    story.append(Paragraph(
        "On the mobile application (or simulator screen):",
        body_style
    ))
    story.append(Paragraph("• Tap <b>'+'</b> on your favorite grocery items (e.g. Potato Chips, Fresh Milk, Soda).", bullet_style))
    story.append(Paragraph("• Your cart shows an instant price summary, tax breakdown, and a celebratory free-delivery progress bar.", bullet_style))
    story.append(Paragraph("• Tap <b>'Place Order'</b> — within 0.1 seconds, confetti appears and the order is locked!", bullet_style))
    story.append(Spacer(1, 6))

    # Step 3
    story.append(Paragraph("Step 3: Switch to 'Rider Partner Mode' (Experience the Delivery)", h2_style))
    story.append(Paragraph(
        "Now experience the journey through the eyes of the delivery courier:",
        body_style
    ))
    story.append(Paragraph("• Tap the <b>'Rider Mode'</b> toggle button at the top of the mobile screen.", bullet_style))
    story.append(Paragraph("• Follow the 4-step delivery stepper: <i>Accept Order → Pick & Pack at Store → Out for Delivery → Delivered</i>.", bullet_style))
    story.append(Paragraph("• Watch the live blue route map: It follows actual roads in Aurangabad (Jalna Road, Kranti Chowk, CIDCO) and turns the bike icon as you move!", bullet_style))
    story.append(Spacer(1, 6))

    # Step 4
    story.append(Paragraph("Step 4: Watch the Inventory Automatically Drop", h2_style))
    story.append(Paragraph(
        "Return to the Manager's Dashboard (Tab 7: Smart Inventory):",
        body_style
    ))
    story.append(Paragraph("• Notice that the item you purchased dropped by exactly 1 unit in the database.", bullet_style))
    story.append(Paragraph("• If the stock drops below 10 units, a bright warning badge appears: <b>'LOW STOCK ALERT'</b>.", bullet_style))
    story.append(Paragraph("• Click the <b>'Auto-Replenish'</b> button to instantly balance supplies from a neighboring hub!", bullet_style))
    story.append(Spacer(1, 10))

    # Visual Comparison Table (Screenshots)
    screen1 = 'docs/screenshots/01_mobile_app_live_dispatch.png'
    screen2 = 'docs/screenshots/02_command_center_telemetry.png'
    if os.path.exists(screen1) and os.path.exists(screen2):
        img_table_data = [
            [
                Image(screen1, width=170, height=220),
                Image(screen2, width=320, height=220)
            ],
            [
                Paragraph("<b>Mobile App:</b> Rider Partner navigation on actual streets.", caption_style),
                Paragraph("<b>Command Center:</b> 3D flight paths and store telemetry.", caption_style)
            ]
        ]
        img_table = Table(img_table_data, colWidths=[180, 324])
        img_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ]))
        story.append(KeepTogether(img_table))

    story.append(PageBreak())

    # ==========================================
    # CHAPTER 4: FREQUENTLY ASKED QUESTIONS (FAQ)
    # ==========================================
    story.append(Paragraph("4. Frequently Asked Questions (FAQ for Non-Techies)", h1_style))

    faqs = [
        ("Q1: Why did you choose 12 mini-stores instead of 1 giant central store?",
         "Aurangabad covers over 130 square kilometers. Driving from one end of the city to the other takes 40+ minutes due to city traffic. By placing 12 compact dark stores across strategic neighborhoods (Cidco, Kranti Chowk, Jalna Rd, Waluj, Railway Station), no customer is ever more than 2.5 km away from a hub!"),
        
        ("Q2: What happens if it rains heavily in Aurangabad?",
         "Quick-commerce riders should never have to drive dangerously. Our system automatically checks live weather and traffic data. If it rains, the app dynamically adds a 3-to-5 minute buffer to the estimated arrival time and tells the customer why, keeping riders safe while managing expectations."),
        
        ("Q3: How do pickers find items inside the dark store so fast?",
         "Inside a traditional supermarket, you wander around aisles looking for items. In our dark stores, an intelligent 'S-Shape Picking Route' algorithm tells the worker the exact sequence of shelves to walk through, like walking in an 'S' curve, so they never have to backtrack or take unnecessary steps."),
         
        ("Q4: Can this project be used for other cities or products?",
         "Absolutely! While we tailored this version for grocery delivery in Chhatrapati Sambhajinagar, the entire architecture is modular. It can be adapted in minutes to medicine delivery, pet food, fresh meats, or deployed in cities like Pune, Nashik, or Nagpur.")
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
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(t)
        story.append(Spacer(1, 8))

    # ==========================================
    # CHAPTER 5: AUTHORS & CONTACT
    # ==========================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("5. Project Credits & Contact Information", h1_style))
    story.append(Paragraph(
        "This project was designed, engineered, and open-sourced as a complete real-world demonstration of quick-commerce logistics feasibility.",
        body_style
    ))

    credits_data = [
        [
            Paragraph("<b>Core Author & Systems Lead:</b>", ParagraphStyle('C1', parent=body_style, fontName='Helvetica-Bold')),
            Paragraph("<b>Neel Belsare</b> • Full-Stack & Systems Engineer<br/>📧 neelbelsare28@gmail.com | 🔗 <a href='https://github.com/NeelBelsare'>github.com/NeelBelsare</a>", body_style)
        ],
        [
            Paragraph("<b>Co-Author & Analytics Lead:</b>", ParagraphStyle('C2', parent=body_style, fontName='Helvetica-Bold')),
            Paragraph("<b>Mansi Gaike</b> • Data Science & Feasibility Analyst", body_style)
        ],
        [
            Paragraph("<b>Open-Source Repository:</b>", ParagraphStyle('C3', parent=body_style, fontName='Helvetica-Bold')),
            Paragraph("🔗 <a href='https://github.com/NeelBelsare/my-dark-store-app'>https://github.com/NeelBelsare/my-dark-store-app</a> (Version 3.0.0 Production)", body_style)
        ]
    ]
    credits_table = Table(credits_data, colWidths=[150, 354])
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
    print(f"Successfully generated Non-Tech Guide PDF at: {filename}")


if __name__ == '__main__':
    output_path = 'docs/Quick_Commerce_Non_Tech_Guide.pdf'
    os.makedirs('docs', exist_ok=True)
    build_pdf(output_path)
