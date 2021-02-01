import argparse
import flask
import json
import psycopg2

app = flask.Flask(__name__)

try:
	connection = psycopg2.connect(database=database, user=user, password=password)
	cursor = connection.cursor()
except Exception as e:
	print(e)
	exit()

'''@app.route('/')
def hello():
    return 'Test: James & Riaz.'''

@app.route('/games')
def get_actor():
    try:
        cursor = connection.cursor()
        games_query = '''SELECT competitions.id, competitions.year, competitions.season, competitions.city
                        FROM competitions
                        ORDER BY competitions.year
                    '''
	    print(cursor.games_query)				 			 	 
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
	
  return json.dumps(games_dictionary)


'''@app.route('/nocs')
def get_movies():
    ''' '''Returns the list of movies that match GET parameters:
          start_year, int: reject any movie released earlier than this year
          end_year, int: reject any movie released later than this year
          genre: reject any movie whose genre does not match this genre exactly
        If a GET parameter is absent, then any movie is treated as though
        it meets the corresponding constraint. (That is, accept a movie unless
        it is explicitly rejected by a GET parameter.)'''
    '''
    movie_list = []
    genre = flask.request.args.get('genre')
    start_year = flask.request.args.get('start_year', default=0, type=int)
    end_year = flask.request.args.get('end_year', default=10000, type=int)
    for movie in movies:
        if genre is not None and genre != movie['genre']:
            continue
        if movie['year'] < start_year:
            continue
        if movie['year'] > end_year:
            continue
        movie_list.append(movie)

    return json.dumps(movie_list)'''

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
