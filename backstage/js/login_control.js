routerApp.controller('LoginCtrl',function($scope,$window,$http,$sessionStorage,$cookies,DataUrlService){
	

	if($cookies.get('artgitalBS')=='loggedIn'){
        $scope.$state.go('project_list');           
    }

	$scope.user_id;
	$scope.user_password;

	// $sessionStorage.$reset();


	$scope.sendLogin=function(){
		 $http({
            method:'POST',
            url:DataUrlService.backstage_url,
            headers:{'Content-Type': undefined},
            data:{
                id:$scope.user_id,
                pass:$scope.user_password
            },
            transformRequest:function(data, headersGetter){
                var formData=new FormData();
                formData.append("active","login");
                
                formData.append("id",data.id);               
                formData.append("pw",data.pass);         
                console.log(formData);

                return formData;
            }
          
        }).success(function(data,status,headers,config){
            
            console.log(data);
            if(data.result==1){

            	// $sessionStorage.loggedIn=true;
            	var expireDate = new Date();
  				expireDate.setDate(expireDate.getDate()+1);

            	$cookies.put('artgitalBS','loggedIn',{expires:expireDate});
            	console.log($cookies.get('artgitalBS'));


                $scope.$state.go('project_list');                        
            }
            else alert("Login Fail!");
        });
	};

	$window.onbeforeunload=function(){
        $sessionStorage.$reset();
    };
});