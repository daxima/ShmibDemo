module.exports = function(grunt) {

    var config_set = grunt.file.readJSON('grunt.json')
    var target = grunt.option('target');

    if (target == null ) {
        console.log('Missing required parameter "target". You supplied ' + target);
        return;
    }


    var config = config_set[target];

    if (config == null) {
        console.log('Cannot find the config for the environment "' + target + '".');
        return;
    }

    var now = new Date();
    var deploy_timestamp = now.getFullYear().toString() + prefixZero(now.getMonth()+1, 2) + prefixZero(now.getDate(), 2)
        + '_' + prefixZero(now.getHours(), 2) + prefixZero(now.getMinutes(), 2)
        + '_' + prefixZero(now.getMilliseconds().toString(), 4);

    var deploy_filename = 'Shmib_' + deploy_timestamp + '.zip'; // Ex: Shmib_20160804_1613_0220.zip

    var dest_root = '/home/shmib/';

    var compressMainOptionsArchive = "";
    var compressFiles = "";
    var sftpMainFiles = "";
    var sftpMainOptionsPath = "";
    var sftpMainOptionsSrcBasePath = "";
    var sshexecUnzipCommand = "";

    if(target == "dev" || target == "qa" || target ==  "staging" ){
       //console.log('this is "dev" || "qa" || "staging" setting');

        compressMainOptionsArchive = './deploy/'+target+'/' + deploy_filename;
        compressFiles = [{expand: true, src: ['./**', '!./deploy/**', '!./grunt.json']}];
        sftpMainFiles = {
          "./": "./deploy/" +target+ "/" + deploy_filename
        }
        sftpMainOptionsPath =   dest_root + '/deploy/'+ target;
        sftpMainOptionsSrcBasePath = "./deploy/"+target+"/";
        sshexecUnzipCommand ='unzip -q -o ' + dest_root + '/deploy/'+target+'/' + deploy_filename + ' -d ' + dest_root + '/sites/'+ config.dest_folder;
    }else if(target == "prod"){
        //console.log('this is prod setting');

         compressMainOptionsArchive = './deploy/'  + deploy_filename;
         compressFiles = [{expand: true, src: ['./**', '!./deploy/**', '!./grunt.json']}];
         sftpMainFiles =  {
           "./": "./deploy/"+ deploy_filename
         }
         sftpMainOptionsPath = dest_root + '/deploy/';
         sftpMainOptionsSrcBasePath = "./deploy/";
         sshexecUnzipCommand = 'unzip -q -o ' + dest_root + '/deploy/'+ deploy_filename + ' -d ' + dest_root + '/web';
    }else {
        console.log('Invalid target value: '+ target);
        return;
    }

    grunt.initConfig({
        exec: {
            bower_install: 'bower install',
            npm_install: 'npm install'
        },
        compress: {
          main: {
            options: {
              //archive: './deploy/'  + deploy_filename
               archive: compressMainOptionsArchive
            },
            //files: [{expand: true, src: ['./**', '!./deploy/**', '!./grunt.json']}]
            files: compressFiles
          }
        },
        sftp: {
          main: {
            files:  sftpMainFiles ,
            options: {
              // path: dest_root + '/deploy/',
              // srcBasePath: "./deploy/",
              path: sftpMainOptionsPath,
              srcBasePath: sftpMainOptionsSrcBasePath,
              createDirectories: true,
              host: config.host,
              username: config.username,
              password: config.password,
              showProgress: true
            }
          }
        },
        sshexec: {
          stopPM2: {
            command: 'pm2 stop '+ config.process_name,
            options: {
              host: config.host,
              username: config.username,
              password: config.password,
            }
          },
          startPM2: {
            command: 'pm2 start '+ config.process_name,
            options: {
              host: config.host,
              username: config.username,
              password: config.password,
            }
          },
          unzip: {
            //command: 'unzip -q -o ' + dest_root + '/deploy/'+ deploy_filename + ' -d ' + dest_root + '/web',
            command: sshexecUnzipCommand,

            options: {
              host: config.host,
              username: config.username,
              password: config.password,
            }
          }
        }
    });

    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-ssh');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('deploy', [
        'exec:bower_install',
        'exec:npm_install',
        'compress:main',
        'sftp:main',
        'sshexec:stopPM2',
        'sshexec:unzip',
        'sshexec:startPM2'
      ]);
};

function prefixZero(input, digits) {
    var val = input.toString();
    if (val.length < digits) {
        var totalPad = digits - val.length;
        for (var i = 0; i < totalPad; i++) {
            val = '0' + val;
        }
    }
    return val;
}
