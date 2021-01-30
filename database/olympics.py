'''Author: Riaz Kelly'''

import argparse
import psycopg2

from config_olympics import password
from config_olympics import database
from config_olympics import user

def get_parsed_arguments():
	'''Parses through command line input'''
	parser = argparse.ArgumentParser(description='Filter and display information about olympic data')
	parser.add_argument('-n', "--noc", nargs = 1, type = str, help='Prints all athletes from a given NOC')
	parser.add_argument('-g', "--gold", action = 'store_true', help='Prints number of gold medals won by each NOC in descending order')
	parser.add_argument('-s', "--silver", nargs = 1, type = str, help='Prints all the silver medals won by a given athlete')

	return parser.parse_args()
	
def cursor_init():
	'''Initializes the cursor'''
	try:
		connection = psycopg2.connect(database=database, user=user, password=password)
		cursor = connection.cursor()
	except Exception as e:
		print(e)
		exit()
	return cursor
    
def get_athletes_noc(noc, cursor):
	'''Returns a list of athletes from the given noc'''
	query = '''SELECT DISTINCT athletes.name 
    				 FROM athletes, athletes_countries_age_competitions, countries
						 WHERE countries.noc = '{}'
						 AND athletes.id = athletes_countries_age_competitions.athletes_id
						 AND athletes_countries_age_competitions.noc_id = countries.id'''.format(noc) 
	try:
		cursor.execute(query)
    	
	except Exception as e:
		print(e)
		exit()
		
	athletes = []
	for row in cursor:
		athlete = row[0]
		athletes.append(athlete)
	
	return athletes
    	
def get_gold_medals(cursor):
	'''Returns a 2D list of how many gold medals each noc has won'''
	query = '''SELECT COUNT(DISTINCT events.id), countries.noc
						 FROM events, countries, athletes_countries_age_competitions
						 WHERE events.gold = athletes_countries_age_competitions.athletes_id
						 AND athletes_countries_age_competitions.competitions_id = events.competitions_id
						 AND athletes_countries_age_competitions.noc_id = countries.id
						 GROUP BY countries.noc
						 ORDER BY COUNT(DISTINCT events.id) DESC'''
	try:
		cursor.execute(query)
		
	except Exception as e:
		print(e)
		exit()
	
	gold_medals = []
	for row in cursor:
		noc = []
		noc_medals = row[0]
		noc_name = row[1]
		
		noc.append(noc_medals)
		noc.append(noc_name)
		gold_medals.append(noc)
		
	return gold_medals

def get_silver_medals(athlete, cursor):
	'''Returns a 2D list of the event and year of every silver medal won by a given athlete'''
	query = '''SELECT events.event, competitions.year
						 FROM events, athletes, competitions
 						 WHERE events.silver = athletes.id
						 AND athletes.name = '{}'
						 AND competitions.id = events.competitions_id
						 ORDER BY competitions.year;'''.format(athlete)
	try:
		cursor.execute(query)
		
	except Exception as e:
		print(e)
		exit()
	
	silver_medals = []
	for row in cursor:
		medal = []
		event = row[0]
		year = row[1]
		
		medal.append(event)
		medal.append(year)
		
		silver_medals.append(medal)
	
	return silver_medals
	return athlete

def print_athletes_noc(noc, athletes):
	print('===== Athletes From {0} ====='.format(noc))
	for athlete in athletes:
		print(athlete)

def print_gold_medals(gold_medals):
	print('===== Gold Medals Won by Each NOC =====')
	for gold_medal in gold_medals:
		noc_medals = gold_medal[0]
		noc_name = gold_medal[1]
		print(noc_medals, '\t', noc_name)

def print_silver_medals(silver_medals, athlete):
	print('===== Silver Medals Won by {0} ====='.format(athlete))
	for silver_medal in silver_medals:
		event = silver_medal[0]
		year = silver_medal[1]
		print(event, '\t', year)
		
def main():
	'''Connects to the database, parses command line input, and calls the appropriate functions'''
	arguments = get_parsed_arguments()
	cursor = cursor_init()
	
	if arguments.noc is not None:
		noc = arguments.noc[0]
		athletes = get_athletes_noc(noc, cursor)
		print_athletes_noc(noc, athletes)
		
	elif arguments.gold:
		gold_medals = get_gold_medals(cursor)
		print_gold_medals(gold_medals)
		
	elif arguments.silver is not None:
		athlete = arguments.silver[0]
		silver_medals = get_silver_medals(athlete, cursor)
		print_silver_medals(silver_medals, athlete)
		
	else:
		print('No search term was specified')
		
	cursor.close()

if __name__ == '__main__':
	main()





