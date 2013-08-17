#!/bin/sh
cd pysrc/
# python3 haschanged.py
# if [ $? -eq 1 ];
# then
	echo "Regenerating data"
	python3 probability.py
	echo "Running cactus"
	cd ..
	cactus build
	echo "Deploying to S3"
	s3_website push --site .build 
# else
#	echo "No changes, exiting"
# fi
