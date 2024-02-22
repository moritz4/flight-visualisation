from google.cloud import storage
import sqlite3
import json

def save_to_bucket(data):
	storage_client = storage.Client()
	bucket = storage_client.bucket("public-7758")
	blob = bucket.blob("flights.json")

	blob.upload_from_string(
		data=json.dumps(data),
		content_type='application/json'
	)

	print("data uploaded to bucket")

def get_data(con):
	cur = con.cursor()

	query = """
SELECT 
  id, 
  time, 
  lat, 
  lon, 
  alt

FROM
  (
    SELECT 
      *,

      LAG(alt) OVER (PARTITION BY id ORDER BY time) AS prev_alt,
      LEAD(alt) OVER (PARTITION BY id ORDER BY time) AS next_alt,
      LAG(heading) OVER (PARTITION BY id ORDER BY time) AS prev_heading

    FROM 
      positions
  )

  WHERE
    time > unixepoch() - 86400 AND
    (alt > 0 OR next_alt > 0 OR prev_alt > 0) AND
    (heading <> prev_heading AND alt <> prev_alt)

ORDER BY
  id, time
"""

	res = cur.execute(query)

	return(res)

def format_data(res):
	# create dict
	dict = {}

	for row in res:
		key = row[0]
		if key in dict:
			dict[key]["time"].append(row[1])
			dict[key]["lat"].append(row[2])
			dict[key]["lon"].append(row[3])
			dict[key]["alt"].append(row[4])
		else:
			dict[key] = {
				"from": "xxx",
				"to": "xxx",
				"time": [row[1]],
				"lat": [row[2]],
				"lon": [row[3]],
				"alt": [row[4]]}

	return(dict)

# open connection to db
con = sqlite3.connect("flights.db")

res = get_data(con)

data = format_data(res)

con.close()

save_to_bucket(data)


