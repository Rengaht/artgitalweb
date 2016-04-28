
/* portfolio grid controller*/
routerApp.controller('ListCtrl',function($scope,$window,$timeout,$filter,
  TagService,portfolioService,scrollRevealService){
    
    $scope.Math=window.Math;

    $scope.tags=TagService.getTags();    
    $scope.items=portfolioService.getItems();

    $scope.colWidth;
    $scope.colNum;
    

      /* scroll reveal */
    $scope.animateElementIn=scrollRevealService.animateElementIn;
    $scope.animateElementOut=scrollRevealService.animateElementOut;
    
    
    $scope.setTag=function(tag_name){
        $scope.selectTag=tag_name;     
        $timeout(function(){ angular.element($window).triggerHandler('resize')},200);    
    };
     // $scope.selfFilter=function(tag1,tag2){
    //     //console.log(tag1);
    //     if(tag1.match(tag2)){ return true}
    //     else{ return false}
    // };
    $scope.getTagName=function(tag_id){       
        if(tag_id===undefined) return;
        if(parseInt(tag_id[0]===undefined)) return;
        if(TagService.getTagName(parseInt(tag_id[0]))===undefined) return;

        return TagService.getTagName(parseInt(tag_id[0])).en;
    };

    //////  for responsive grid layout //////
    $scope.updateWidth=function(){
      var containerWidth=$('.portfolioGridWrap').width();
      if(containerWidth>=1100){
        $scope.colNum=4;
      }else if(containerWidth>=900){
        $scope.colNum=2;
      }else{
        $scope.colNum=1;
      }
      $scope.colWidth=containerWidth/$scope.colNum;
      
      // console.log($scope.colWidth+" "+$scope.colNum);

    };
    $scope.getPosition=function(index){
      
      return {
            'top': (Math.floor(index/$scope.colNum) * $scope.colWidth)+'px',
            'left': ((index%$scope.colNum) * $scope.colWidth)+'px',   
            'width': $scope.colWidth+'px',                    
            'height': $scope.colWidth+'px'
      }      
    };

    /* auto updateWidth when window resizing */
    angular.element($window).bind('resize',function(){
      $scope.updateWidth();
      $scope.$apply();
    });
    /* updateWidth once when page loaded*/
    $timeout(function() {
      $scope.updateWidth();
    },300);
    
    ////////////////////////////////////

    $scope.correctPath=function(path){
      return DataUrlService.correct_image_url+path;
    }

});

routerApp.controller('DetailCtrl',
  function($scope,$stateParams,$http,$location,$anchorScroll,
            DataUrlService,TagService,portfolioService,scrollRevealService){
     
     $scope.project=null;
     $scope.textList=[];

     $http.get(DataUrlService.p_url+$stateParams.pid).success(function(data){        
        // $scope.title=data.title;
        // $scope.top_descript=data.top_descript;
        // $scope.top_image=data.top_image;

        // $scope.sub_contents=data.sub_contents;        
        $scope.project=data;

        $scope.project.overview.title_image=DataUrlService.correct_image_url+$scope.project.overview.title_image;
        $scope.project.overview.logo_image=DataUrlService.correct_image_url+$scope.project.overview.logo_image;
          
        var len=$scope.project.detail.length;
        for(var i=0;i<len;++i){

          

          if($scope.project.detail[i].type=='text') $scope.textList.push($scope.project.detail[i].title);
          else if($scope.project.detail[i].type=='image_1'){
            $scope.project.detail[i].image_src=DataUrlService.correct_image_url+$scope.project.detail[i].image_src;
          }else if($scope.project.detail[i].type=='image_2'){
            $scope.project.detail[i].image_src_1=DataUrlService.correct_image_url+$scope.project.detail[i].image_src_1;
            $scope.project.detail[i].image_src_2=DataUrlService.correct_image_url+$scope.project.detail[i].image_src_2;
          }
        }
        // console.log($scope.project);
        $scope.relatedItems=portfolioService.getRelatedItems($scope.project.overview.id);
    });
    
    $scope.getTagNameList=function(tag_list){

        if(tag_list==undefined) return;

        var tlist='';
        var len=tag_list.length;
        for(var i=0;i<len;++i)
            tlist+=TagService.getTagName(tag_list[i]).ch+' ';

        return tlist; 
    }
    $scope.getTagName=function(tag_id){        
        
        return TagService.getTagName(parseInt(tag_id[0])).en;
    };

    $scope.getTextIndex=function(title){
        return $scope.textList.indexOf(title);
    };



    /* scroll reveal */
    $scope.animateElementIn=scrollRevealService.animateElementIn;
    $scope.animateElementOut=scrollRevealService.animateElementOut;
    

    $scope.animateTitleIn = function($el) {         
      // $el.find('.textTitleLineContainer').addClass('textTitleLineContainerShow');
      // $el.find('.textTitleText').addClass('textTitleTextShow'); 
      var line=$el.find('.textTitleLineContainer');
      var text=$el.find('.textTitleText');
      
      line.css('left',"-100%");
      text.css('opacity',0);

      line.animate({left:"0%"},250,'easeOutQuart',function(){
          text.animate({opacity:"1"},200,'easeInQuart',function(){
            line.animate({left:"100%"},300,'easeInQuart',function(){

            });
          });
      });
    };

    $scope.animateTitleOut = function($el) {
      
       // $el.find('.textTitleLineContainer').removeClass('textTitleLineContainerShow');
       // $el.find('.textTitleText').removeClass('textTitleTextShow'); 
      var line=$el.find('.textTitleLineContainer');
      var text=$el.find('.textTitleText');
      
      line.css('left',"-100%");
      text.css('opacity',0);

      line.animate({left:"-100%"},400,function(){});
      text.animate({opacity:"0"},200,function(){});

    };

    $scope.animateCircleIn = function($el){
        $el.css('opacity','0');
        $el.css('margin-top','50px');
        $el.delay(400).animate({'margin-top':'0px','opacity':'1'},250,'easeOutQuart');
    };

    $scope.animateCircleOut = function($el) {
        // $el.css('padding-top','80px');
        // $el.delay(500).animate({padding-top:'0px'},500);
    };


    $scope.gotoText=function(text){
     // console.log('go'+text);        
     if($location.hash()!==text) $anchorScroll(text);
     else{ $anchorScroll();}
    };


});

routerApp.controller('AboutCtrl',
  function($scope,TagService,portfolioService,scrollRevealService){

  $scope.animateElementIn=scrollRevealService.animateElementIn;
  $scope.animateElementOut=scrollRevealService.animateElementOut;

  $scope.relatedItems=portfolioService.getRelatedItems(-1);
  $scope.getTagName=function(tag_id){        
        return TagService.getTagName(parseInt(tag_id[0])).en;
  };


});

routerApp.controller('ContactCtrl',
  function($scope,$location,$anchorScroll,$http,scrollRevealService){

  $scope.animateElementIn=scrollRevealService.animateElementIn;
  $scope.animateElementOut=scrollRevealService.animateElementOut;

  $scope.items;
  $http.get('data/jobs.json').success(function(data){        
      $scope.items=data.jobs;
  });


  $scope.scrollToEmail=function(){
     $anchorScroll('_contact_info');
  };

});


routerApp.controller('IssueCtrl',function($scope,$window,issueService,scrollRevealService){
    
    $scope.items=issueService.getItems();
    // console.log($scope.items);

    $scope.animateElementIn=scrollRevealService.animateElementIn;
    $scope.animateElementOut=scrollRevealService.animateElementOut;
});

routerApp.controller('IssueDetailCtrl',function($scope,$http,$stateParams,DataUrlService,scrollRevealService){
    
    $scope.item;
    $http.get(DataUrlService.issue_url+$stateParams.pid).success(function(data){        
        if(data.result==1) $scope.item=data.issueFull;
        console.log($scope.item);
    });
    
    $scope.animateElementIn=scrollRevealService.animateElementIn;
    $scope.animateElementOut=scrollRevealService.animateElementOut;
});