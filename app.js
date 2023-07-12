var app = angular.module("myApp", ["ngRoute"]);

app.config(function($routeProvider) {
  $routeProvider
    .when("/", {
        templateUrl: "signup.html",
        controller: "SignupController"
      }).when("/login", {
      templateUrl: "login.html",
      controller: "LoginController"
    }).when("/dashboard", {
      templateUrl: "dashboard.html",
      controller:"DashboardController"
    }).when("/Question", {
      templateUrl: "QuestionPage.html",
      controller: "QuestionController"
    }).when('/previousScores',{
      templateUrl:"previousScores.html",
      controller:"QuestionController"
    })
    .otherwise({
      templateUrl: "signup.html",
      controller: "SignupController"
    });
});

//Controllers
app.controller("LoginController", function($scope,$rootScope, $location, $http) {
    $scope.login = function() {
      // Fetch user data from JSON file or server-side endpoint
      $http.get("users.json").then(function(response) {
        var users = response.data.users;
        console.log($scope.user.emailLogin);

        var flag=true;
        for(let obj of users){
          // console.log(obj.email+">>>>"+$scope.user.emailLogin);
          if(obj.email==$scope.user.emailLogin && obj.password===$scope.user.passwordlogin){
            alert("Sucess");
            //email for score
            $rootScope.usersname=obj.name;
            flag=false;
            $location.path("/dashboard");
            }
        }
        if(flag){
            alert("Failed");
        }
    })};
  });
  
  app.controller("SignupController", function($scope, $location, $http) {
    $scope.signup = function() {
      $http.get("users.json").then(function(response) {
        var users = response.data;
            $http({
            method:'POST',
            url:("http://localhost:3000/users"),
            data:$scope.user
        }).then(function (response) {
          alert("Signup successful");
            console.log(response);
             $location.path("/login");
        },function(error) {
            console.log(error)
        })

            
            // Redirect to login page
            
          });
        }   
      });



        //QuestionCOntroller
        app.controller("QuestionController", function($scope, $rootScope, $location, $route, $http) {
          $scope.questions = [];
          $scope.score = 0;
          $scope.total = 5;
          $scope.showScore = false;
          $scope.scores = [];

          $http.get('http://localhost:3000/scores')
          .then(function(response) {
          $scope.scores = response.data;
          })
          .catch(function(error) {
          console.log(error);
          });
        
          $scope.selectedCategory='';
          $scope.selectedDifficulty='';
          $scope.selectedType='';
          var url=`https://opentdb.com/api.php?amount=5&category=${$rootScope.selectedCategory}&difficulty=${$rootScope.selectedDifficulty}&type=${$rootScope.selectedType}`;
        
          $scope.fetchQuestions = function() {
            $http({
                method: 'GET',
                url: url
              })
              .then(function(response) {
                console.log(url);
                $scope.triviaData = response.data.results;
                $scope.questions = $scope.triviaData.map(function(result) {
                  var options = result.incorrect_answers;
                  options.push(result.correct_answer);
                  return {
                    question: result.question,
                    options: options,
                    correctAnswer: result.correct_answer,
                    selectedOption: '',
                    isAnswerCorrect: false
                  };
                });
              })
              .catch(function(error) {
                console.log(error);
              });
          };
        
          $scope.checkAnswer = function(question) {
            question.isAnswerCorrect = (question.selectedOption === question.correctAnswer);
          };
        
          $scope.SubmitQuiz = function() {
            $scope.score = 0;
            for (let i = 0; i < 5; i++) {
              var question = $scope.questions[i];
              if (question.selectedOption === question.correctAnswer) {
                $scope.score++;
              }
            }
            alert("Your Score is: " + $scope.score);
        
            var scores = {
              usersname: $rootScope.usersname,
              score: $scope.score
            };
        
            $http.post('http://localhost:3000/scores', scores)
              .then(function(response) {})
              .catch(function(error) {
                console.log(error);
              });
        
            $location.path("/previousScores");

            
          };
        
          // Fetch questions initially
          $scope.fetchQuestions();
        });


          app.controller("DashboardController", function($scope,$rootScope,$location, $http) {

            $scope.startQuiz=function(){
              $rootScope.selectedCategory = this.selectedCategory;
              console.log($rootScope.selectedCategory);
              $rootScope.selectedDifficulty = this.selectedDifficulty;
              $rootScope.selectedType = this.selectedType;
              console.log('clicked');
              $location.path("/Question");
            }
          })




          //https://opentdb.com/api.php?amount=5&category=21&difficulty=easy&type=multiple
          //https://opentdb.com/api.php?amount=5&category=undefined&difficulty=Easy&type=Multiple