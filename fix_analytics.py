import re

with open("src/components/dashboard/account-analytics.tsx", "r") as f:
    content = f.read()

# Fix AreaChart fallback
content = content.replace(
    "<AreaChart data={realStats?.followerData?.length ? realStats.followerData : followerData}>", 
    "<AreaChart data={realStats ? realStats.followerData : followerData}>"
)

# Fix BarChart fallback
content = content.replace(
    "<BarChart data={realStats?.balanceData?.length ? realStats.balanceData : balanceData}>", 
    "<BarChart data={realStats ? realStats.balanceData : balanceData}>"
)

# Fix Gender PieChart
content = content.replace(
    "data={realStats?.genderData?.length ? realStats.genderData : genderData}", 
    "data={realStats ? realStats.genderData : genderData}"
)
content = content.replace(
    "{(realStats?.genderData?.length ? realStats.genderData : genderData).map", 
    "{(realStats ? realStats.genderData : genderData).map"
)

# Fix Age BarChart
content = content.replace(
    "<BarChart data={realStats?.ageData?.length ? realStats.ageData : ageData}", 
    "<BarChart data={realStats ? realStats.ageData : ageData}"
)

# Fix Country data
content = content.replace(
    "data={realStats?.countryData?.length ? realStats.countryData : countryData}", 
    "data={realStats ? realStats.countryData : countryData}"
)
content = content.replace(
    "{(realStats?.countryData?.length ? realStats.countryData : countryData).map", 
    "{(realStats ? realStats.countryData : countryData).map"
)

with open("src/components/dashboard/account-analytics.tsx", "w") as f:
    f.write(content)
print("Fixed component fallbacks")

with open("src/app/actions/analytics.ts", "r") as f:
    action_content = f.read()

# Add zero-padding to time-series in analytics.ts
old_time_series_logic = """    try {
      // 1. Time-series growth & balance
      const timeSeriesRes = await ytAnalytics.reports.query({
        ids: 'channel==MINE',
        startDate,
        endDate,
        metrics: 'views,subscribersGained,subscribersLost',
        dimensions: 'day',
        sort: 'day'
      });

      if (timeSeriesRes.data.rows) {
        let runningSubs = totalSubs; // Simplified: we don't know the exact starting point without more math, we'll map views instead
        followerData = timeSeriesRes.data.rows.map((row: any) => {
          const [date, views, gained, lost] = row;
          return {
            date: date.substring(5), // 'YYYY-MM-DD' -> 'MM-DD'
            views: views,
            subscribers: gained - lost, // Net change
          };
        });

        balanceData = timeSeriesRes.data.rows.map((row: any) => {
          const [date, views, gained, lost] = row;
          return {
            date: date.substring(5),
            gained: gained,
            lost: lost,
          };
        });
      }"""

new_time_series_logic = """    try {
      // 1. Time-series growth & balance
      // Initialize zero-padded arrays for the last 30 days
      const days = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
      }
      
      const timeSeriesRes = await ytAnalytics.reports.query({
        ids: 'channel==MINE',
        startDate,
        endDate,
        metrics: 'views,subscribersGained,subscribersLost',
        dimensions: 'day',
        sort: 'day'
      });

      const rowMap = new Map();
      if (timeSeriesRes.data.rows) {
        timeSeriesRes.data.rows.forEach((row: any) => {
           rowMap.set(row[0], row);
        });
      }

      followerData = days.map(day => {
        const row = rowMap.get(day);
        if (row) {
          return { date: day.substring(5), views: row[1], subscribers: row[2] - row[3] };
        }
        return { date: day.substring(5), views: 0, subscribers: 0 };
      });

      balanceData = days.map(day => {
        const row = rowMap.get(day);
        if (row) {
          return { date: day.substring(5), gained: row[2], lost: row[3] };
        }
        return { date: day.substring(5), gained: 0, lost: 0 };
      });"""

action_content = action_content.replace(old_time_series_logic, new_time_series_logic)

# Replace demoRes and geoRes to return dummy data if empty so UI doesn't crash on map
old_demo = """      if (demoRes.data.rows) {
        const genders: Record<string, number> = { male: 0, female: 0 };
        const ages: Record<string, number> = {};

        demoRes.data.rows.forEach((row: any) => {
          const [ageGroup, gender, percentage] = row;
          if (gender === 'male' || gender === 'female') {
             genders[gender] += percentage;
          }
          const formattedAge = ageGroup.replace('age', '');
          ages[formattedAge] = (ages[formattedAge] || 0) + percentage;
        });

        genderData = [
          { name: 'Male', value: Math.round(genders.male) },
          { name: 'Female', value: Math.round(genders.female) }
        ].filter(d => d.value > 0);

        ageData = Object.entries(ages).map(([age, value]) => ({
          age, value: Math.round(value)
        }));
      }"""

new_demo = """      if (demoRes.data.rows && demoRes.data.rows.length > 0) {
        const genders: Record<string, number> = { male: 0, female: 0 };
        const ages: Record<string, number> = {};

        demoRes.data.rows.forEach((row: any) => {
          const [ageGroup, gender, percentage] = row;
          if (gender === 'male' || gender === 'female') {
             genders[gender] += percentage;
          }
          const formattedAge = ageGroup.replace('age', '');
          ages[formattedAge] = (ages[formattedAge] || 0) + percentage;
        });

        genderData = [
          { name: 'Male', value: Math.round(genders.male) },
          { name: 'Female', value: Math.round(genders.female) }
        ].filter(d => d.value > 0);

        ageData = Object.entries(ages).map(([age, value]) => ({
          age, value: Math.round(value)
        }));
      } else {
        genderData = [{ name: 'No Data', value: 100 }];
        ageData = [{ age: 'No Data', value: 0 }];
      }"""

action_content = action_content.replace(old_demo, new_demo)

with open("src/app/actions/analytics.ts", "w") as f:
    f.write(action_content)
print("Fixed analytics padding")
