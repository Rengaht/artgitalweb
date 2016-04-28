
/* Extension to js array */

Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};

Array.prototype.clear = function() {
  while (this.length) {
    this.pop();
  }
};




/* for ng */
var routerApp = angular.module('routerApp', ['ui.router','flow','ngStorage','ngCookies']);

/* all urls here */
routerApp.factory('DataUrlService',function(){

    var host_url='http://artgital.com/'

    return{
        tag_url: host_url+'s/website.php?active=getTag',
        
        all_p_url: host_url+'s/website.php?active=getAllProjects&publish=1',
        p_url:host_url+'s/website.php?active=getProjectDetail&id=',
        
        all_issue_url: host_url+'s/website.php?active=getAllIssues',
        issue_url:host_url+'s/website.php?active=getIssueFull&sid=',

        backstage_url:host_url+'s/backstage.php',

        correct_image_url:host_url
    };

});

routerApp.service('TagService', function($http,DataUrlService){
    var tags=null;
    var promise=$http.get(DataUrlService.tag_url).success(function(data){
        if(data.result==1) tags=data.tags;     
        console.log('Get tags success!');
    });
    return{
        promise:promise,
        getTagName:function(tid){
            var len=tags.length;
            for(var i=0;i<len;++i){ 
                // console.log(tags[i].id+' '+tid);
                if(tags[i].id==tid) return tags[i];            
            }
        },
        getTags:function(){
            return tags;
        }
    };
});

/* load all projects */
routerApp.service('PortfolioService', function($http,DataUrlService){
    var pitems=null;
    var promise=$http.get(DataUrlService.all_p_url).success(function(data){
        if(data.result==1) pitems=data.items;     
        console.log('Get projects success!');
    });
    return{
        promise:promise,        
        getItems:function(){
            return pitems;
        },
        reloadData:function(){
            $http.get(DataUrlService.all_p_url).success(function(data){
                if(data.result==1){
                    pitems=data.items; 
                    console.log(pitems);
                    console.log('Get projects success!');
                    return pitems; 
                }
            });               
        }
    };
});

/* temporarily save project data between controllers */
routerApp.service('ProjectParamService',function(){
    var projects=[];
    var imageFlow=[];
    return{

        addProject:function(project){
            projects.clear();
            projects.push(project);
            console.log('Add project: '+projects.length);
        },
        findById:function(id){
            console.log('Find project'+id);
            // console.log(projects);
            return projects.filter(function(proj){
                if(proj.id==id) return true;
                return false;
            });
        },
        updateProject:function(id,project){
            var len=projects.length;
            for(var i=0;i<len;++i){
                if(projects[i].id==id){
                    projects[i]=project;
                    return;
                }
            }
        },
        updateImageFlow:function(img_flow){
           // imageFlow.clear();
            imageFlow=img_flow;
            // console.log("set image_flow");
            // console.log(imageFlow);
        },
        getImageFlow:function(){
            // console.log("get image_flow");
            // console.log(imageFlow);
            return imageFlow;

        }
    };   
});

/*  read video type json */
routerApp.service('VideoTypeService',function($http){
    var videoHost;
    var promise=$http.get('data/video_type.json').success(function(data){
        videoHost=data;      
        console.log('Get video type success!');          
    });
    return{
        promise:promise,
        getVideoHost:function(){
            return videoHost
        },
        encodeVideoUrl:function(vtype,vid){
            return videoHost[vtype]+vid;
        },
        decodeVideoUrl:function(vurl){
            // console.log('decode: '+vurl);
            for(var key in videoHost){
                if(vurl.indexOf(key)!=-1){                    
                    var si=vurl.lastIndexOf('/');
                    // console.log(key+' '+vurl.substr(si,vurl.length-si));
                    return {'type':key,
                            'id': vurl.substr(si+1,vurl.length-si-1)};
                }
            }
        }
    }

});


routerApp.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/login');
    
    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'partial/login.html',
            controller:'LoginCtrl'
        })
        
        // HOME STATES AND NESTED VIEWS ========================================
        .state('project_list', {
            url: '/project',
            templateUrl: 'partial/list.html',
            controller:'ListCtrl',
            resolve:{              
                'PortfolioData':function(PortfolioService){
                    return PortfolioService.promise;
                },
                'TagData':function(TagService){
                    return TagService.promise;
                },
                'VideoTypeData':function(VideoTypeService){
                    return VideoTypeService.promise;
                }
            }
        })
        .state('project_create',{
            url:'/project/create',
            templateUrl:'partial/overview.html',
            controller:'OverviewCtrl'
            // resolve:{              
            //     'TagData':function(TagService){
            //         return TagService.promise;
            //     }
            // }
        })        
        .state('project_add_detail', {
            url: '/project/:pid',
            templateUrl: 'partial/detail.html',
            controller:'DetailCtrl'
        })
        .state('project_overview',{
            url:'/project/overview/:pid',
            templateUrl:'partial/overview.html',            
            controller:'OverviewCtrl'
        })
        .state('project_detail',{
            url:'/project/detail/:pid',
            templateUrl:'partial/detail.html',                   
            controller:'DetailCtrl'
            
        })
        .state('project_preview',{
            url:'/project/preview/:pid',
            templateUrl:'partial/preview.html',
            controller:'PreviewCtrl'
        })
        .state('issues', {
            url: '/issues',
            templateUrl: 'partial/issues.html',
            controller:'IssueListCtrl'
        })
        .state('issue_create', {
            url: '/issues/create',
            templateUrl: 'partial/issue_detail.html',
            controller:'IssueDetailCtrl'
        })
        .state('issue_detail', {
            url: '/issues/:pid',
            templateUrl: 'partial/issue_detail.html',
            controller:'IssueDetailCtrl'
        });
       
        
});
routerApp.run(function($rootScope,$state,$stateParams){
    $rootScope.$state=$state;
    $rootScope.$stateParams=$stateParams;
});


/* sub-directives for image upload */
routerApp.directive('agImageUploader',function(){
    return{
        restrict:'E',
        templateUrl: 'partial/image_uploader.html',
        scope: {
            imageInfo:'@',
            imageObject:'=',
            imageUrl:'@'
        }
    };
});

/* sub-directives for text circle in preview */
routerApp.directive('agTextCircle',function(){
    return{
        restrict:'E',
        templateUrl: '../partial/text_circle.html',
        scope: {
            itemList:'=',
            itemShow:'@',
            goText:'='
        }
    }
});

/* use to load outer urls */
routerApp.filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);
