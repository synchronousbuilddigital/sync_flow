import re

with open("src/components/dashboard/account-analytics.tsx", "r") as f:
    content = f.read()

# Add fallback constants inside the component logic or map directly in the return
old_area = "<AreaChart data={followerData}>"
new_area = "<AreaChart data={realStats?.followerData?.length ? realStats.followerData : followerData}>"
content = content.replace(old_area, new_area)

# Change AreaChart lines for YouTube if needed: YouTube uses Views in followerData
# The tooltip needs to know if it's followers or views, but we'll map `followers` to the line for simplicity right now?
# Actually we mapped `views` in python backend!
old_area_line = """<Area type="monotone" dataKey="followers" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorFollowers)" />"""
new_area_line = """<Area type="monotone" dataKey={network === 'YouTube' ? 'views' : 'followers'} stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorFollowers)" />"""
content = content.replace(old_area_line, new_area_line)

old_bar = "<BarChart data={balanceData}>"
new_bar = "<BarChart data={realStats?.balanceData?.length ? realStats.balanceData : balanceData}>"
content = content.replace(old_bar, new_bar)

old_pie = "data={genderData}"
new_pie = "data={realStats?.genderData?.length ? realStats.genderData : genderData}"
content = content.replace(old_pie, new_pie)

old_pie_map = "{genderData.map((entry, index) => ("
new_pie_map = "{(realStats?.genderData?.length ? realStats.genderData : genderData).map((entry: any, index: number) => ("
content = content.replace(old_pie_map, new_pie_map)

# Replace Age BarChart data
old_age = "<BarChart data={ageData} layout=\"vertical\" margin={{top: 0, right: 30, left: 0, bottom: 0}}>"
new_age = "<BarChart data={realStats?.ageData?.length ? realStats.ageData : ageData} layout=\"vertical\" margin={{top: 0, right: 30, left: 0, bottom: 0}}>"
content = content.replace(old_age, new_age)

# Replace Country PieChart data
old_country = "data={countryData}"
new_country = "data={realStats?.countryData?.length ? realStats.countryData : countryData}"
content = content.replace(old_country, new_country)

old_country_map = "{countryData.map((entry, index) => ("
new_country_map = "{(realStats?.countryData?.length ? realStats.countryData : countryData).map((entry: any, index: number) => ("
content = content.replace(old_country_map, new_country_map)

# Replace the specific UI list mapping for Followers By Country and Followers By City
old_country_list = "{countryData.map((country, i) => ("
new_country_list = "{(realStats?.countryData?.length ? realStats.countryData : countryData).map((country: any, i: number) => ("
content = content.replace(old_country_list, new_country_list)


with open("src/components/dashboard/account-analytics.tsx", "w") as f:
    f.write(content)
print("Updated charts to use real data")
