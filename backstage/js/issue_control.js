routerApp.controller('IssueListCtrl',function($scope,$window,$http,DataUrlService){
   
   
    $scope.items;

    $http.get(DataUrlService.all_issue_url).success(function(data){
        if(data.result==1) $scope.items=data.issues;                
    });
   // console.log($scope.items);
   
    $scope.removeIssue=function(pid){
        $http({
            method:'POST',
            url:DataUrlService.backstage_url,
            headers:{'Content-Type': undefined},
            data:{
                             
            },
            transformRequest:function(data, headersGetter){
                var formData=new FormData();
                formData.append("active","removeIssue");
                formData.append("sid",pid);
                           
                return formData;
            }
          
        }).success(function(data,status,headers,config){
            console.log(data);
            //update after success!            
            if(data.result==1){
                alert("Remove Success!");
               $scope.reloadItem();
            }else alert("Remove Fail!");
        });

    };
    
    $scope.reloadItem=function(){        
        // $scope.items=PortfolioService.reloadData();      
        // console.log($scope.items);
         $window.location.reload();
    };

});

routerApp.controller('IssueDetailCtrl',function($scope,$stateParams,$http,DataUrlService){
   
    $scope.item={'sid':null};
    
    $scope.thumb_flow={};
    
    $scope.loading=false;

    // console.log($stateParams.pid);

    if($stateParams.pid!==undefined){
        $scope.item.sid=$stateParams.pid;
        $http.get(DataUrlService.issue_url+$scope.item.sid).success(function(data){
            if(data.result==1) $scope.item=data.issueFull;           
        });
    }
    
    
    $scope.createIssue=function(){

        $scope.loading=true;

        var cmd=JSON.stringify($scope.item);
        // console.log(cmd);


        $http({
            method:'POST',
            url:DataUrlService.backstage_url,
            headers:{'Content-Type': undefined},
            data:{
                cmd:cmd,
                thumb_file:($scope.thumb_flow.flow.files[0]!==undefined)?$scope.thumb_flow.flow.files[0].file:null
            },
            transformRequest:function(data, headersGetter){
                var formData=new FormData();
                if($scope.$state.current.name=='issue_create') formData.append("active","addNewIssue");
                else formData.append("active","updateIssue");
                // formData.append("active","updateIssue");

                formData.append("cmd",data.cmd);
               
                formData.append("thumb",data.thumb_file);
          

                return formData;
            }
          
        }).success(function(data,status,headers,config){
            
            $scope.loading=false;

            console.log(data);
            if(data.result==1){
                $scope.$state.go('issues');                        
            }
            else alert("Upload Fail!");
        });

        // }
    };


});