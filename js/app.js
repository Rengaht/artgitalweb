
var routerApp = angular.module('routerApp', ['ui.router','ngAnimate','ngResource','angular-scroll-animate','customFilters']);

routerApp.factory('DataUrlService',function(){
    var host_url='http://giraffe.artgital.com/artgital/';
    return{
        tag_url: host_url+'s/website.php?active=getTag',
        all_p_url: host_url+'s/website.php?active=getAllProjects',
        p_url:host_url+'s/website.php?active=getProjectDetail&id=',
        all_issue_url:host_url+'s/website.php?active=getAllIssues',
        issue_url:host_url+'s/website.php?active=getIssueFull&sid=',

        correct_image_url:host_url
    };

});

/* load tags */
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

/* load projects */
routerApp.service('portfolioService', function($http,DataUrlService){
    var pitems=null;
    var promise=$http.get(DataUrlService.all_p_url).success(function(data){
        if(data.result==1) pitems=data.items;     
        console.log('Get projects success!');

        for(var i in pitems){
            pitems[i].thumb_image=DataUrlService.correct_image_url+pitems[i].thumb_image;
        }

        // console.log(data.items);
    });
    return{
        promise:promise,        
        getItems:function(){
            return pitems;
        },
        getRelatedItems:function(pid){
            var ritem=[];
            var num=0;
            for(var i in pitems){
                if(pid!=pitems[i].id){
                    ritem.push(pitems[i]);
                    num++;                    
                    if(num>=8) break;
                }
            }
            return ritem;
        }
    };
});

/* load issues */
routerApp.service('issueService', function($http,DataUrlService){
    var pitems=null;
    var promise=$http.get(DataUrlService.all_issue_url).success(function(data){
        if(data.result==1) pitems=data.issues;     
        console.log('Get issues success!');

        /* merge traditional_chinese & simplified_chinese items */
        for(var i in pitems){
            // console.log(pitems[i].title+'is sch:'+pitems[i].title.includes("簡中"));
            if(pitems[i].title.indexOf('簡中')==-1) continue;

            for(var j in pitems){
                if(j==i) continue;
                if(pitems[j].issue_number==pitems[i].issue_number){
                    pitems[j].hasSCH=true;
                    pitems[j].sch_sid=pitems[i].sid;

                    pitems.splice(i,1);
                    break;
                }
            }
        }
        // console.log(pitems);
    });
    return{
        promise:promise,        
        getItems:function(){
            // console.log(pitems);
            return pitems;
        }
    };
});

routerApp.service('scrollRevealService',function(){
    return{
        animateElementIn: function($el){
              $el.removeClass('hideToScroll');
              $el.addClass('scrollIn'); 
            },
        animateElementOut: function($el){
              $el.addClass('hideToScroll');
              $el.removeClass('scrollIn'); 
            }
    };
});

/* use ui-router to load different pages */
routerApp.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/welcome');
    
    $stateProvider       
        .state('portfolio', {
            url: '/portfolio',
            templateUrl: 'partial/portfolio.html',
            controller:'ListCtrl',
            resolve:{
                'TagServiceData':function(TagService){
                    return TagService.promise;
                },
                'PortfolioData':function(portfolioService){
                    return portfolioService.promise;
                }
            }
        })
        .state('pdetail',{
            url:'/project/:pid',
            templateUrl:'partial/detail.html',
            controller:'DetailCtrl',
            resolve:{
                'TagServiceData':function(TagService){
                    return TagService.promise;
                },
                'PortfolioData':function(portfolioService){
                    return portfolioService.promise;
                }
            }
        })
         .state('welcome', {
            url: '/welcome',
            templateUrl: 'partial/welcome.html',
            controller:'ListCtrl',
            resolve:{
                'TagServiceData':function(TagService){
                    return TagService.promise;
                },
                'PortfolioData':function(portfolioService){
                    return portfolioService.promise;
                }
            }
        })
        .state('about', {
            url: '/about',
            templateUrl: 'partial/about.html',
            controller:'AboutCtrl',
             resolve:{
                'TagServiceData':function(TagService){
                    return TagService.promise;
                },
                'PortfolioData':function(portfolioService){
                    return portfolioService.promise;
                }
            }            
        })
        .state('services', {
            url: '/services',
            templateUrl: 'partial/services.html',
            controller:'AboutCtrl',
            resolve:{
                'TagServiceData':function(TagService){
                    return TagService.promise;
                },
                'PortfolioData':function(portfolioService){
                    return portfolioService.promise;
                }
            }   
        })
        .state('issues', {
            url: '/issues',
            templateUrl: 'partial/issues.html',
            controller:'IssueCtrl',
            resolve:{
                'IssueServiceData':function(issueService){
                    return issueService.promise;
                }
            }
        })
        .state('issue_detail',{
            url:'/issues/:pid',
            templateUrl:'partial/issue_detail.html',
            controller:'IssueDetailCtrl'
        })


        .state('fanpage', {
            url: '/fanpage',
            controller:function($scope,$window){
                $window.open('http://www.facebook.com/Artgital/','_blank');
                $scope.$state.go('welcome');
            }  
        })
        .state('contact', {
            url: '/contact_us',
            templateUrl: 'partial/contact_us.html',
            controller:'ContactCtrl'     
        });
        
});

/* use to load images or videos */
routerApp.filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);

/* use to load html (for issues) */
routerApp.filter("sanitize", ['$sce', function($sce) {
  return function(htmlCode){
    return $sce.trustAsHtml(htmlCode);
  }
}]);

/* set up parameters passing between controllers */
routerApp.run(function($rootScope,$state,$stateParams){
    $rootScope.$state=$state;
    $rootScope.$stateParams=$stateParams;
});


/* circle and thumbnail in portfolio grid*/
routerApp.directive('agListCaption',function(){
    return{
        restrict:'E',
        templateUrl: 'partial/list_caption.html',
        scope: {
            itemInfo:'=',
            itemTag:'@',
            itemSize:'@'
        }
    }
});

/* circle in project detail */
routerApp.directive('agDetailCircle',function(){
    return{
        restrict:'E',
        templateUrl: 'partial/detail_circle.html',
        scope: {
            itemList:'=',
            itemShow:'@',
            goText:'='
        }
    }
});

/* circle and thumbnail in issue grid*/
routerApp.directive('agIssueCaption',function(){
    return{
        restrict:'E',
        templateUrl: 'partial/issue_caption.html',
        scope: {
            itemInfo:'=',
            itemSize:'@'           
        }
    }
});

routerApp.run(['$anchorScroll', function($anchorScroll) {
  $anchorScroll.yOffset = 100;   // always scroll by 50 extra pixels
}])



angular.module('customFilters',[]).filter('search',function(){
    return function(input_items,searchStr){

        if(searchStr==undefined || searchStr=='') return input_items;
        
        var filtered=[];
        angular.forEach(input_items,function(item){
            if(item.tag.indexOf(searchStr)!=-1) 
                filtered.push(item);
        });
        return filtered;
    };
});
