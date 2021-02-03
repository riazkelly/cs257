import argparse
import flask
import json
import psycopg2

app = flask.Flask(__name__)

from config_olympics import password
from config_olympics import database
from config_olympics import user

try:
	connection = psycopg2.connect(database=database, user=user, password=password)
	cursor = connection.cursor()
except Exception as e:
	print(e)
	exit()

'''@app.route('/')
def hello():
    return 'Test: James & Riaz.'''

def add_medal(medalists_dict, gold, silver, bronze):
	if gold is not None:
		gold = 'gold'
		medalists_dict.__setitem__('medal ', gold)
		return medalists_dict
	elif silver is not None:
		silver = 'silver'
		medalists_dict.__setitem__('medal ', silver)
		return medalists_dict
	else:
		bronze = 'bronze'
		medalists_dict.__setitem__('medal ', bronze)
		return medalists_dict

def set_medalists_dict(cursor):
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
		medalists_dict = add_medal(medalists_dict, gold, silver, bronze)
		medalists_list.append(medalists_dict)
	
	return medalists_list

@app.route('/games')
def get_games():
	try:
		cursor = connection.cursor()
		games_query = '''SELECT competitions.id, competitions.year, competitions.season, competitions.city
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
	try:
		cursor = connection.cursor()
		noc_query = '''SELECT countries.noc, countries.region
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
	try:
		cursor = connection.cursor()
		noc = flask.request.args.get('noc')
		if noc is None:
			medalists_query = '''SELECT DISTINCT athletes.id, athletes.name, athletes.sex, events.sport, 
													 events.event, events.gold, events.silver, events.bronze
												 	 FROM athletes, events, athletes_countries_age_competitions
												 	 WHERE athletes_countries_age_competitions.competitions_id = {}
													 AND athletes_countries_age_competitions.athletes_id = athletes.id
												 	 AND (athletes_countries_age_competitions.athletes_id = events.gold
												 	 OR athletes_countries_age_competitions.athletes_id = events.silver
													 OR athletes_countries_age_competitions.athletes_id = events.bronze)
												 	 '''.format(competitions_id)
												 	 
		else:
			medalists_query = '''SELECT DISTINCT athletes.id, athletes.name, athletes.sex, events.sport, 
												 	 events.event, events.gold, events.silver, events.bronze
												 	 FROM athletes, events, athletes_countries_age_competitions, countries
												 	 WHERE (athletes_countries_age_competitions.competitions_id = {0}
												 	 AND athletes_countries_age_competitions.athletes_id = athletes.id
												 	 AND athletes_countries_age_competitions.noc_id = countries.id
												 	 AND countries.noc = {1})
												 	 AND ((athletes_countries_age_competitions.athletes_id = events.silver)
												 	 OR (athletes_countries_age_competitions.athletes_id = events.gold)
												 	 OR (athletes_countries_age_competitions.athletes_id = events.bronze))
												 	 '''.format(competitions_id, noc)
		cursor.execute(medalists_query)
	except Exception as e:
		print(e)
		exit()
	
	medalists_list = set_medalists_dict(cursor)
	return json.dumps(medalists_list)
		
	else:
		return json.dumps("didnt work")
			

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
