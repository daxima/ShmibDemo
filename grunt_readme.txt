================================================================================
Update 'grunt.json' file
================================================================================
You will need the file 'grunt.json' to run. It holds the config info for SSH.
Please create it in the same folder.

There is a sample file 'grunt_sample.json'. You can use it as a template.

Add CLI npm package too
================================================================================
Run grunt deploy
================================================================================

grunt deploy --target="<environment_name>"

See the file 'grunt.json' for the list of environments.

Ex below: 

grunt deploy --target="staging"

grunt deploy --target="qa"

grunt deploy --target="dev"
