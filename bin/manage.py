import sys
from build import build


if __name__ == '__main__':
	command= sys.argv[1]
	output_file= None
	
	if len(sys.argv) == 3:
		output_file= sys.argv[2]
	
	if command == 'build_client':
		build(output_file, 'client_settings')
	elif command == 'build_server':
		build(output_file, 'server_settings')
	else:
		print "Selected command is not available."
