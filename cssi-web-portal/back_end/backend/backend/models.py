import psycopg2
import uuid

# connec = psycopg2.connect(dbname='postgres', user = 'postgres', password= '', host ='localhost')

# cur = connec.cursor()

# cur.execute('''CREATE TABLE member (
#             email VARCHAR(30), id int
#             );''')

# email = str('stud@nevada.unr.edu')
# id = 1

# cur.execute('''INSERT INTO member (email, id ) VALUES (%s, %s)''', (email, id))

# connec.commit()
#     cur.close()
#     connec.close()

def checkEmail(email:str):

    connec = psycopg2.connect(dbname='postgres', user = 'postgres', password= '', host ='localhost')  #change line to fit postgresql database info 

    cur = connec.cursor()

    query = """(select id from member where email = '"""
    query += email 
    query += """');"""

    cur.execute(query)
    id = cur.fetchall()

    cur.close()
    connec.close()

    if len(id):
        return True

    return False


def createMember(email):
    connec = psycopg2.connect(dbname='postgres', user = 'postgres', password= '', host ='localhost') #change line to fit postgresql database info 

    cur = connec.cursor()

    id = uuid.uuid1().hex

    cur.execute('''INSERT INTO member (id, email) VALUES (%s, %s)''', (id, email))

    connec.commit()
    cur.close()
    connec.close()



