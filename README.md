# **🛒 Dark Store Feasibility Analysis 📊**  
**An Interactive AI-Powered Tool for Strategic Dark Store Placement**  

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue?logo=python)](https://www.python.org/)
[![Streamlit](https://img.shields.io/badge/Built%20With-Streamlit-orange?logo=streamlit)](https://streamlit.io/)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Neel%20Belsare-0A66C2?logo=linkedin)](https://www.linkedin.com/in/neel-belsare-719b9a314/)
[![GitHub](https://img.shields.io/badge/GitHub-NeelBelsare-181717?logo=github)](https://github.com/NeelBelsare/my-dark-store-app)

---

## 🔗 **GitHub Repository**: [NeelBelsare/my-dark-store-app](https://github.com/NeelBelsare/my-dark-store-app)
👨‍💻 **Developer**: [Neel Belsare](https://www.linkedin.com/in/neel-belsare-719b9a314/)

---

## 🚀 **Project Overview**  
Dark Stores are **closed fulfillment centers** designed exclusively for **online orders**, enabling faster deliveries and efficient inventory management. **Where should these stores be located to maximize efficiency and revenue?**  

This project provides a **data-driven solution** to **analyze, predict and recommend optimal locations** for Dark Stores using **Machine Learning, Data Visualization and Interactive Maps**.  

🔹 **Key Features:**  
✅ **Predict Demand for Different Neighborhoods**  
✅ **Recommend Top 6 Locations to Open Dark Stores**  
✅ **Identify High-Demand Areas Needing Multiple Stores**  
✅ **Visualize Trends with Interactive Graphs & Maps**  
✅ **Machine Learning-Based Demand Forecasting**  

---

## 🏗️ **How It Works**  
1️⃣ **Data Collection & Cleaning**  
   - Raw data is processed in **Google Colab** notebooks (included in this repo).  
   - The **cleaned, processed dataset** is used for predictions.  

2️⃣ **Data Analysis & Visualization**  
   - Population growth, order volume trends and demand spikes analyzed.  
   - Graphs & charts provide insights into neighborhood potential.  

3️⃣ **Machine Learning Model**  
   - Uses **Linear Regression** to predict future demand.  
   - Evaluated with **Mean Absolute Error (MAE) & RMSE** for accuracy.  

4️⃣ **Streamlit Web App**  
   - Users can **interact with data, view recommendations and explore maps**.  

---

## 🔥 **Tech Stack**  
| **Component** | **Technology Used** |
|--------------|------------------|
| Programming | Python 🐍 |
| Web Framework | Streamlit 🎈 |
| Data Processing | Pandas, NumPy |
| Machine Learning | Scikit-Learn 🤖 |
| Visualization | Plotly, Matplotlib 📊 |
| Mapping | Folium 🗺️ |
| Data Cleaning | Google Colab 🚀 |

---

## 🖥️ **Installation & Setup**  

### **🔹 Clone the Repository**  
```bash
git clone https://github.com/NeelBelsare/my-dark-store-app.git
```

### **🔹 Run the Streamlit App**  
```bash
streamlit run app.py
```
---

## 📂 **Project Structure**  
Only for this repo. You can change data as per your need and upload your own Data Sets for Analysis.

```
📦 Dark-Store-Feasibility  
│-- 📂 data  
│   │-- 📂 processed
│   │   │-- Merged_Pune_Dark_Store_Data.csv
│   │   │-- Pune_Climate_Delivery_Impact.csv
│   │   │-- Pune_Neighborhood_Population_Analysis.csv
│   │   │-- Pune_Online_Activity_Prediction.csv
│   │   │-- pune_dark_stores.csv
│   │  
│   │-- 📂 raw
│   │   │-- Pune_Raw_Climate_Data.csv
│   │   │-- Pune_Raw_Online_Activity_Data.csv
│   │   │-- Pune_Raw_Population_Data.csv
│   │   │-- pune-ward-wise-census-2011.csv  
│  
│-- 📂 notebooks  
│   │-- Clean_Climate.ipynb  # Cleans climate data  
│   │-- DataCleaner.ipynb  # Processes raw data  
│  
│-- 📂 app  
│   │-- app.py  # Streamlit app  
│   │-- model.py  # Machine Learning model  
│  
│-- LICENSE
│-- MainScript.py
│-- README.md
│-- index.html  # GitHub Pages support  
│-- requirements.txt
```

---

## 🎯 **Key Features **  

### **📊 Data Insights & Visualization**  
- **Population & order volume trends per neighborhood**  
- **Bar charts, scatter plots & interactive graphs**  

### **🏆 Top 6 Neighborhood Recommendations**  
- **Find the best locations for opening Dark Stores**  
- **See order volume projections**  

### **🚦 High-Demand Locations (Requiring 2 Stores)**  
- **Identifies areas where 1 store isn't enough**  
- **Helps optimize store placement**  

### **📈 Machine Learning Demand Prediction**  
- **Forecasts future demand trends**  
- **Improves decision-making for dark store expansion**  

### **🗺️ Interactive Dark Store Map**  
- **View existing & recommended store locations**  
- **Zoom in for neighborhood-level analysis**  

---

## 🔍 **Machine Learning Model**  
📌 **Algorithm Used:** **Linear Regression**  
📌 **Evaluation Metrics:**  
   - **Mean Absolute Error (MAE)**: Measures prediction accuracy.  
   - **Root Mean Squared Error (RMSE)**: Checks for large deviations.  

---

## 🔮 **Future Improvements**  
💡 **Better ML Models**: Try **XGBoost, Random Forest** for higher accuracy.  
🌍 **Live Data Feeds**: Integrate **real-time order tracking & traffic analysis**.  
📊 **Competitor Heatmaps**: Identify areas with **less competition** for strategic placement.  

---

## 🤝 Contribution  
Contributions are welcome!  
Feel free to fork this repo, suggest improvements or submit a pull request.

---

## 📜 **License**  
This project is licensed under the **MIT License** – feel free to use, modify and distribute it.  
See the [LICENSE](LICENSE) file for full details.

---

## ⭐ **Like This Project? Give It a Star!** ⭐  
If you found this useful, **consider giving it a star ⭐** on GitHub!  

---
