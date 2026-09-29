import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Set MPLCONFIGDIR
os.environ['MPLCONFIGDIR'] = '/tmp/mpl_cache'

# Canvas setup - 1200 x 480 px high-res infographic
fig_w, fig_h = 12.0, 4.8
dpi = 150
fig, ax = plt.subplots(figsize=(fig_w, fig_h), dpi=dpi)
fig.patch.set_facecolor('#0F172A')  # Modern Dark Slate
ax.set_facecolor('#0F172A')
ax.set_xlim(0, 1200)
ax.set_ylim(0, 480)
ax.axis('off')

# Title & Subtitle Banner
ax.text(600, 445, "THE 10-MINUTE QUICK-COMMERCE JOURNEY (FROM TAP TO DOORSTEP)",
        fontfamily='sans-serif', fontsize=14, fontweight='bold', color='#FFFFFF', ha='center', va='center')
ax.text(600, 420, "How an order travels seamlessly through the 4-tier autonomous dispatch ecosystem",
        fontfamily='sans-serif', fontsize=9.5, color='#94A3B8', ha='center', va='center')

# 4 Step Boxes Coordinates
box_w, box_h = 240, 310
box_y = 65
steps = [
    {
        "x": 40,
        "num": "STEP 1",
        "time": "0:00 - 0:30",
        "title": "CUSTOMER ORDERS",
        "subtitle": "Mobile App (React Native)",
        "color": "#8B82F6",
        "bg": "#1E1B4B",
        "bullets": [
            "• Live GPS locks delivery address",
            "• Instant cart & tax calculation",
            "• Tap 'Place Order' with 1-click",
            "• Dispatch engine finds nearest hub"
        ],
        "badge": "GPS LOCK"
    },
    {
        "x": 330,
        "num": "STEP 2",
        "time": "0:30 - 2:30",
        "title": "PICK & PACK AT HUB",
        "subtitle": "Micro-Warehouse (Dark Store)",
        "color": "#10B981",
        "bg": "#064E3B",
        "bullets": [
            "• Picker receives order instantly",
            "• S-Shape shelf route saves walking",
            "• Packed in under 120 seconds",
            "• Database auto-deducts inventory"
        ],
        "badge": "< 120 SEC"
    },
    {
        "x": 620,
        "num": "STEP 3",
        "time": "2:30 - 9:30",
        "title": "STREET NAVIGATION",
        "subtitle": "Rider Partner Mode",
        "color": "#38BDF8",
        "bg": "#0C4A6E",
        "bullets": [
            "• Courier accepts on bike screen",
            "• Real road routing via OSRM",
            "• Dynamic bearing rotation HUD",
            "• Rain/traffic safety SLA buffer"
        ],
        "badge": "LIVE GPS"
    },
    {
        "x": 910,
        "num": "STEP 4",
        "time": "9:30 - 11:30",
        "title": "DOORSTEP DELIVERY",
        "subtitle": "Delighted Customer",
        "color": "#F59E0B",
        "bg": "#78350F",
        "bullets": [
            "• Doorbell rings in ~11 minutes!",
            "• Courier marks 'Delivered'",
            "• Real-time WebSocket sync",
            "• Control Tower updates stats"
        ],
        "badge": "11 MIN SLA"
    }
]

for s in steps:
    x = s["x"]
    # Outer card
    card = patches.FancyBboxPatch(
        (x, box_y), box_w, box_h,
        boxstyle="round,pad=0,rounding_size=14",
        facecolor='#1E293B', edgecolor=s["color"], linewidth=1.8
    )
    ax.add_patch(card)
    
    # Top Header Pill inside card
    header_pill = patches.FancyBboxPatch(
        (x + 12, box_y + box_h - 38), box_w - 24, 26,
        boxstyle="round,pad=0,rounding_size=8",
        facecolor=s["bg"], edgecolor=s["color"], linewidth=1
    )
    ax.add_patch(header_pill)
    
    ax.text(x + 22, box_y + box_h - 25, s["num"], fontfamily='sans-serif', fontsize=9.5, fontweight='bold', color=s["color"], va='center')
    ax.text(x + box_w - 22, box_y + box_h - 25, s["time"], fontfamily='sans-serif', fontsize=8.5, fontweight='bold', color='#E2E8F0', ha='right', va='center')

    # Card Title
    ax.text(x + 15, box_y + box_h - 58, s["title"], fontfamily='sans-serif', fontsize=11, fontweight='bold', color='#FFFFFF', va='center')
    ax.text(x + 15, box_y + box_h - 76, s["subtitle"], fontfamily='sans-serif', fontsize=8.5, color='#94A3B8', va='center')

    # Divider
    ax.plot([x + 15, x + box_w - 15], [box_y + box_h - 90, box_y + box_h - 90], color='#334155', linewidth=1)

    # Bullet Points
    by = box_y + box_h - 115
    for b in s["bullets"]:
        ax.text(x + 15, by, b, fontfamily='sans-serif', fontsize=8.2, color='#CBD5E1', va='center')
        by -= 24

    # Bottom Badge
    badge_pill = patches.FancyBboxPatch(
        (x + 15, box_y + 16), box_w - 30, 24,
        boxstyle="round,pad=0,rounding_size=6",
        facecolor='#0F172A', edgecolor=s["color"], linewidth=0.8
    )
    ax.add_patch(badge_pill)
    ax.text(x + box_w/2, box_y + 28, s["badge"], fontfamily='sans-serif', fontsize=8.5, fontweight='bold', color=s["color"], ha='center', va='center')

# Connecting Arrows between Steps
arrows = [(280, 220), (570, 220), (860, 220)]
for ax_pos, ay_pos in arrows:
    arrow = patches.FancyArrowPatch(
        (ax_pos, ay_pos), (ax_pos + 46, ay_pos),
        arrowstyle='->,head_width=5,head_length=8',
        color='#94A3B8', linewidth=2.5
    )
    ax.add_patch(arrow)

# Bottom Status Footer
footer_box = patches.FancyBboxPatch(
    (40, 10), 1110, 36,
    boxstyle="round,pad=0,rounding_size=8",
    facecolor='#1E293B', edgecolor='#334155', linewidth=1
)
ax.add_patch(footer_box)
ax.text(600, 28, "ALL 4 STEPS TALK IN REAL TIME VIA SUPABASE CLOUD WEBSOCKETS • ZERO MANUAL INTERVENTION",
        fontfamily='sans-serif', fontsize=8.5, fontweight='bold', color='#10B981', ha='center', va='center')

output_path = 'docs/screenshots/non_tech_order_journey.png'
os.makedirs('docs/screenshots', exist_ok=True)
plt.tight_layout()
plt.savefig(output_path, dpi=dpi, facecolor='#0F172A', bbox_inches='tight')
plt.close()
print(f"Generated non-tech order journey flowchart at: {output_path}")
