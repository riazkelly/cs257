'''By James Marlin and Riaz Kelly'''

import argparse
import flask
import json
import psycopg2

app = flask.Flask(__name__)

from config import password
from config import database
from config import user

try:
	connection = psycopg2.connect(database=database, user=user, password=password)
	cursor = connection.cursor()
except Exception as e:
	print(e)
	exit()

def add_medal(medalists_dict, gold, silver, bronze, athletes_id):
	'''Adds which medal the medalist won to the respective medalist's dictionary'''
	if gold == athletes_id:
		gold = 'gold'
		medalists_dict.__setitem__('medal ', gold)
	elif silver == athletes_id:
		silver = 'silver'
		medalists_dict.__setitem__('medal ', silver)
	else:
		bronze = 'bronze'
		medalists_dict.__setitem__('medal ', bronze)
	return medalists_dict

def set_medalists_dict(cursor):
	'''Makes and returns the list of medalists, where each medalist is a dictionary'''
	medalists_list = []
	for row in cursor:
		athletes_id = row[0]
		athletes_name = row[1]
		athletes_sex = row[2]
		sport = row[3]
		event = row[4]
		gold = row[5]
		silver = row[6]
		bronze = row[7]
		
		medalists_dict = {'athletes_id ': athletes_id, 'athletes_name ': athletes_name, 
		'athletes_sex': athletes_sex, 'sport ': sport, 'event ': event}
		medalists_dict = add_medal(medalists_dict, gold, silver, bronze, athletes_id)
		medalists_list.append(medalists_dict)
	
	return medalists_list

@app.route('/games')
def get_games():
	'''Makes and returns a JSON list of dictionaries, each of which represents one Olympic Games'''
	try:
		cursor = connection.cursor()
		games_query = '''SELECT DISTINCT competitions.id, competitions.year, competitions.season, competitions.city
										 FROM competitions
										 ORDER BY competitions.year'''
		cursor.execute(games_query)
	except Exception as e:
		print(e)
		exit()
	
	games_list = []	
	for row in cursor:
		id = row[0]
		year = row[1]
		season = row[2]
		city = row[3]
		games_dict = {'id ': id, 'year ': year, 'season ': season, 'city ': city}
		games_list.append(games_dict)
	
	return json.dumps(games_list)

@app.route('/nocs')
def get_noc():
	'''Makes and returns a JSON list of dictionaries, each of which represents one NOC, 
		 organized alphabetically'''
	try:
		cursor = connection.cursor()
		noc_query = '''SELECT DISTINCT countries.noc, countries.region
									 FROM countries
									 ORDER BY countries.noc'''
		cursor.execute(noc_query)
	except Exception as e:
		print(e)
		exit()
	
	noc_list = []	
	for row in cursor:
		abbreviation = row[0]
		name = row[1]
		noc_dict = {'abbreviation ': abbreviation, 'name ': name}
		noc_list.append(noc_dict)
	
	return json.dumps(noc_list)

@app.route('/medalists/games/<int:competitions_id>')
def get_medalist(competitions_id):
	'''Returns a JSON list of dictionaries, each of which represents a medalist at
		 the specified Olympic Games. Will return only those of a specified country if
		 requested'''
	try:
		cursor = connection.cursor()
		noc = flask.request.args.get('noc')
		if noc is None:
			medalists_query = '''SELECT DISTINCT athletes.id, athletes.name, athletes.sex, events.sport, 
													 events.event, events.gold, events.silver, events.bronze
												 	 FROM athletes, events, athletes_countries_age_competitions
												 	 WHERE athletes_countries_age_competitions.competitions_id = {}
												 	 AND athletes_countries_age_competitions.athletes_id = athletes.id
												 	 AND (athletes.id = events.gold
												 	 OR athletes.id = events.silver
													 OR athletes.id = events.bronze)
												 	 '''.format(competitions_id)
		else:
			medalists_query = '''SELECT DISTINCT athletes.id, athletes.name, athletes.sex, events.sport,
													 events.event, events.gold, events.silver, events.bronze
													 FROM athletes, events, athletes_countries_age_competitions, countries
													 WHERE (athletes_countries_age_competitions.competitions_id = {0}
													 AND athletes_countries_age_competitions.athletes_id = athletes.id
													 AND athletes_countries_age_competitions.noc_id = countries.id
													 AND countries.noc = '{1}')
													 AND (athletes.id = events.gold
													 OR athletes.id = events.silver
													 OR athletes.id = events.bronze)'''.format(competitions_id, noc)
												 	 
		cursor.execute(medalists_query)
	except Exception as e:
		print(e)
		exit()
	
	medalists_list = set_medalists_dict(cursor)
	return json.dumps(medalists_list)
			

@app.route('/help')
def get_help():
    return flask.render_template('help.html')

if __name__ == '__main__':
    parser = argparse.ArgumentParser('A sample Flask application/API')
    parser.add_argument('host', help='the host on which this application is running')
    parser.add_argument('port', type=int, help='the port on which this application is listening')
    arguments = parser.parse_args()
    app.run(host=arguments.host, port=arguments.port, debug=True)
    connection.close()
