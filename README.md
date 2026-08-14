# MR MRR Front-End Break-Even Calculator v1.4

Mobile-optimised campaign break-even calculator for VIP Club / digital membership stores.

Core formulas:
- Front-End ROAS = Front-End Revenue / Ad Spend
- Actual CPA = Ad Spend / Number of Sales
- AOV = Front-End Revenue / Number of Sales
- Total COGS = Average COGS per Order × Number of Sales
- First Rebill Revenue at 100% Approval = Number of Sales × VIP Membership Price
- Rebill Revenue Needed to Break Even = max(0, Ad Spend + Total COGS - Front-End Revenue)
- Break-Even Approval Rate = Rebill Revenue Needed / First Rebill Revenue at 100%
- Projected Rebill Revenue = First Rebill Revenue at 100% × Approval Rate
- Projected Profit Before Fees = Front-End Revenue + Projected Rebill Revenue - Ad Spend - Total COGS
- Projected Profit Per Customer = Projected Profit Before Fees / Number of Sales
- ROAS After First Rebill = Total Revenue After First Rebill / Ad Spend
