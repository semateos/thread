var webPage = require('webpage');
var page = webPage.create();

page.open('http://thread.meteor.com', function(status) {

  if (status !== 'success') {
      console.log('Unable to load the address!');
      phantom.exit(1);
  } else {

      window.setTimeout(function () {

        for(var i = 0; i < 3; i++){

          var paths = page.evaluate(function() {

            var fetchBatch = function(last_id){

              var where = {};

              if(last_id){

                where = {_id:{$gt: last_id}};
              }

              var array = Paths.find(where, {limit: 100}).fetch();

              return array;

            }

            var arrayToString = function(array){

              var string = '';

              for(var i = 0; i < array.length; i++){

                string += JSON.stringify(array[i]) + ",\n";
              }

              return string;
            }


            var string = '';

            var array = fetchBatch(window.last);

            if(array){

              window.last = array[array.length - 1]['_id'];
            }

            string += arrayToString(array);


            return string;

          });

          console.log(paths);

        }

        phantom.exit();

      }, 10000);
  }



});
