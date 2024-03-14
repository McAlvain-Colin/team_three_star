import time
import psycopg2
import uuid

class sensor_data():
    def __init__(self, time, dev_eui, payload_json, metadata_json):
        self.time = time
        self.dev_eui = dev_eui
        self.payload_json = payload_json
        self.metadata_json = metadata_json
        
class devices():
    def __init__(self, dev_eui, application_id):
        self.dev_eui = dev_eui
        self.application_id = application_id
    

class applications():
    def __init__(self, name, description):
        self.name = name
        self.description = description
    

class application_user():
    def __init__(self, application_id, user_id):
        self.application_id = application_id
        self.user_id = user_id
    

class organization_user():
    def __init__(self, organization_id, user_id):
        self.organization_id = organization_id
        self.user_id = user_id    

class application_organization():
    def __init__(self, application_id, organization_id):
        self.application_id = application_id
        self.organization_id = organization_id
    

class users():
    def __init__(self, name, email, is_active):
        self.name = name
        self.email = email
        self.is_active = is_active
    

class organizations():
    def __init__(self, name, email, is_active):
        self.name = name
        self.email = email
        self.is_active = is_active
    

class gateway_users():
    def __init__(self, gateway_id, user_id):
        self.gateway_id = gateway_id
        self.user_id = user_id
    

class gateway_organizations():
    def __init__(self, gateway_id, organization_id):
        self.gateway_id = gateway_id
        self.organization_id= organization_id
    

class gateways():
    def __init__(self, name, description):
        self.name = name
        self.description = description
    


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



