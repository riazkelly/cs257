import argparse
import psycopg2

from config import password
from config import database
from config import user

def parse_args():
    '''Parse the command line arguments.'''
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('-g', '--gold', action='store_true', help='lists all the NOCs and the number of gold medals they have won, in decreasing order of the number of gold medals.')
    group.add_argument('-n', '--noc', nargs=1, type=str, help='given an NOC, prints a list of all their athletes.')
    group.add_argument('-y', '--year', nargs=1, type=int, help='given a year, prints the number of athletes who competed.')
    group.add_argument('-s', '--sport', metavar='S', nargs=1, type=str, help='given a sport, prints all the years it has been competed in.')
    return parser.parse_args()

def cursor_init():
    '''Connects to database and initializes the cursor.'''
    try:
        connection = psycopg2.connect(database=database, user=user, password=password)
        cursor = connection.cursor()
    except Exception as e:
        print(e)
        exit()
    return cursor

def query(args, cursor):
    '''Set the query based on the argument past and then execute it.'''
    if args.gold:
        query = '''SELECT COUNT(DISTINCT events.id), countries.noc
                   FROM events, countries, athletes_countries_age_competitions
                   WHERE events.gold = athletes_countries_age_competitions.athletes_id
                   AND events.competitions_id = athletes_countries_age_competitions.competitions_id
                   AND athletes_countries_age_competitions.noc_id = countries.id
                   GROUP BY countries.noc
                   ORDER BY COUNT(DISTINCT events.id) DESC;'''
    elif args.noc is not None:
        noc = args.noc[0]
        query = '''SELECT DISTINCT athletes.name
                   FROM athletes, athletes_countries_age_competitions, countries
                   WHERE countries.noc = '{}'
                   AND athletes.id = athletes_countries_age_competitions.athletes_id
                   AND athletes_countries_age_competitions.noc_id = countries.id;
                   '''.format(noc)
    elif args.year is not None:
        year = args.year[0]
        query = '''SELECT COUNT(DISTINCT athletes.name)
                   FROM athletes, events, competitions, athletes_events
                   WHERE competitions.year = {}
                   AND events.competitions_id = competitions.id
                   AND events.id = athletes_events.events_id
                   AND athletes.id = athletes_events.athletes_id;
                   '''.format(year)
    elif args.sport is not None:
        sport = args.sport[0].capitalize()
        query = '''SELECT DISTINCT competitions.year
                   FROM competitions, events
                   WHERE events.sport = '{}'
                   AND events.competitions_id = competitions.id;
                   '''.format(sport)
    try:
        cursor.execute(query)
    except Exception as e:
        print(e)
        exit()

def display_query(cursor):
    '''Prints the query result.'''
    for row in cursor:
        print(' '.join(map(str, row)))

def main():
    args = parse_args()
    cursor = cursor_init()
    query(args, cursor)
    display_query(cursor)
    cursor.close()

if __name__ == '__main__':
    main()