"use strict";

module.exports = function (grunt) {

    require("load-grunt-tasks")(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        watch: {
            options: {
                livereload: true
            },
            // scripts: {
            // files:
            // }
            express: {
                files: ["server.js", "!**/node_modules/**", "!gruntfile.js", "lib/**"],
                tasks: ["express:dev", "wait"],
                options: {
                    nospawn: true
                }
            }
        },

        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            all: [
                "server.js",
                "Gruntfile.js",
                "lib/**/*.js",
                "lib/*.js"
            ]
        },

        express: {
            dev: {
                options: {
                    script: "server.js",
                    debug: true
                }
            }
        },

        execute: {
            parse: {
                options: {
                    cwd: "./lib/util"
                },
                src: ["./lib/util/satparser.js"]
            }
        },

        env: {
            local: {
                NODE_ENV: "local"
            },
            test: {
                NODE_ENV: "test"
            }
        },

        mochaTest: {
            parse: {
                options: {
                    require: "./test/globals/globals.js",
                    reporter: "spec",
                    colors: true,
                    timeout: 2000
                },
                src: ["./test/globals/spec_helper.js", "./test/test/parser/*.js"]
            },
            api: {
                options: {
                    require: "./test/globals/globals.js",
                    reporter: "spec",
                    colors: true,
                    timeout: 5000
                },
                src: ["./test/globals/spec_helper.js", "./test/test/api/*.js"]
            }
        },

        mongobackup: {
            options: {
                host : "localhost",
                port: "27017",
                db : "sj-local",
                dump: {
                    out : "./dump"
                },
                restore:{
                    path : "./dump/sj-local",
                    drop : true
                }
            }
        },

        testbackup: {
            options: {
                host: "localhost",
                port: "27017",
                db: "sj-test",
                dump: {
                    out: "./dump"
                },
                restore: {
                    path: "./dump/sj-test",
                    drop: true
                }
            }
        }

    });

    // Used for delaying livereload until after server has restarted
    grunt.registerTask("wait", function () {
        grunt.log.ok("Waiting for server reload...");

        var done = this.async();

        setTimeout(function () {
            grunt.log.writeln("Done waiting!");
            done();
        }, 2000);
    });

    grunt.registerTask("parse", "parsing csv data", [
        "env:local",
        "express:dev",
        "execute:parse"
    ]);

    grunt.registerTask("workon", "start work on project", [
        "jshint",
        "env:local",
        "express:dev",
        "watch"
    ]);


    grunt.registerTask("test", function(target) {
        if (target === "parse") {
            return grunt.task.run([
                "env:test",
                "testbackup:restore",
//        "express:dev",
//        "wait",
                "mochaTest:parse"
            ]);
        }
        if (target === "api") {
            return grunt.task.run([
                "env:test",
                "testbackup:restore",
                "mochaTest:api"
            ]);
        }


    });

    grunt.registerTask("testbackup", function(task) {
        var done = this.async();
        var args = [];
        var baseArgs = ["--host=localhost", "--port=27017", "--db=sj-test"];
        var restoreArgs = ["--drop", "./dump/sj-test"];
        var dumpArgs = ["--out=./dump"];

        if (task === "dump") {
            args = baseArgs.concat(dumpArgs);
        }
        if (task === "restore") {
            args = baseArgs.concat(restoreArgs);
        }

        grunt.util.spawn({
                cmd: "mongo" + task,
                args: args,
                opts: { stdio: [ process.stdin,
                    process.stout,
                    process.stderr
                ]
                }
            },
            function (error, result) {
                if (error) {
                    grunt.log.error(result.stderr);
                }
                grunt.log.writeln(result.stdout);
                done();
            });
    });

};

