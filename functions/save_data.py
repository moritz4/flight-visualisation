# Script to read current plane positions from API and store in sqllite database
from urllib.request import Request, urlopen
import json
import sqlite3


BASEURL = "https://data-cloud.flightradar24.com/zones/fcgi/feed.js"
AIRPORTS = ["LTN", "LHR", "LGW", "STN", "BHX", "LCY", "MAN", "LPL", "GLA"]

def getData():
	# make a dict of query parameters
	queries = [[BASEURL + "?to=" + airport, BASEURL + "?from=" + airport] for airport in AIRPORTS]
	# flatten
	queries = [x for xs in queries for x in xs]

	# Read data from API. Merge list of dicts into single dict
	data = [queryAPI(query) for query in queries]
	data = {k: v for d in data for k, v in d.items()}

	# Turn into list of tuples, which sqlite expects
	# key, time, lat, lon, alt, heading
	data = [(key, value[10], value[1], value[2], value[4], value[3]) for key, value in data.items()]

	return(data)

# Makes a GET request to endpoint specified
def queryAPI(string):
    r = Request(string)
    r.add_header('User-Agent', 'Mozilla/5.0')

    x = json.loads(urlopen(r).read().decode("utf=8"))

    del x["full_count"]
    del x["version"]

    return(x)

def create_tables():
	con = sqlite3.connect("flights.db")
	cur = con.cursor()

	cur.execute("CREATE TABLE IF NOT EXISTS positions(id TEXT, time INTEGER, lat REAL, lon REAL, alt INTEGER, heading INTEGER)")
	con.commit()
	con.close()

def write_data(data):
	con = sqlite3.connect("flights.db")
	cur = con.cursor()

	cur.executemany("INSERT INTO positions VALUES(?, ?, ?, ?, ?, ?)", data)
	con.commit()

	con.close()

data = getData()
create_tables()
write_data(data)
print("Wrote " + str(len(data)) + " rows to DB")
