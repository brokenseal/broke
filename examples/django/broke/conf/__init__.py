"""
The HOSTMAP variable is a dictionary of lists, the keys representing
roles of a server, the values representing the hostnames of machines that
fill those roles.

You can get your hostname by typing `hostname` into a terminal.
"""

import socket, warnings, sys
from django.utils.importlib import import_module

HOSTMAP = {
	'development': [
		'iRule',
		'rfc-1918',
		'ubuntu',
	],
	'staging': [
		'vps2728.webhosting.uk.com',
	],
	'production': [
#		'vps2728.webhosting.uk.com',
	],
}

def update_current_settings(file_name):
	"""
	Given a filename, this function will insert all variables and
	functions in ALL_CAPS into the global scope.
	"""
	new_settings = import_module(file_name)
	
	for k, v in new_settings.__dict__.items():
		if k.upper() == k:
			globals().update({k:v})

current_hostname = socket.gethostname()
to_load = []

for k, v in HOSTMAP.items():
	if current_hostname in v:
		to_load.append(k)

for x in to_load:
	new_settings_path= 'broke.conf.%s' % x
	try:
		update_current_settings(new_settings_path)
	except ImportError:
		warnings.warn("Failed to import %s" % new_settings_path)
