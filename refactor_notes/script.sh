#!/bin/sh
BASE_FOLDER=$1
REFACTOR_TARGET=$2

grep -n -r -o '^[ ]*this\.[^ ]*[ ]*=' $1 | sed 's/this.\([^ ^=]*\)[ ]*=/\1/'
STATE_LINES=$(cat ../refactor_notes/all_public_interfaces.csv| grep state.js)
FUNCTION_NAME=$(echo $STATE_LINES | sed '4q;d' | sed 's/.*,//')
grep -r -n $FUNCTION_NAME .
