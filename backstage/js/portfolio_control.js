routerApp.controller('ListCtrl',function($scope,$window,$http,$sessionStorage,$cookies,PortfolioService,DataUrlService){
   
    /* check login */
    // if(!$sessionStorage.loggedIn){        
    //     alert('Not logged in!');
    //     $scope.$state.go('login');    
    // }
    // $window.onbeforeunload=function(){
    //     $sessionStorage.$reset();
    // };
    // console.log($cookies.get('artgitalBS'));
    if($cookies.get('artgitalBS')!='loggedIn'){
        alert('Not logged in!');
        $scope.$state.go('login');    
    }

    $scope.items=PortfolioService.getItems();  

   // console.log($scope.items);
    $scope.updateOrder=function(){
        var orderlist=[];
        var len=$scope.items.length;
        for(var i=0;i<len;++i){
            orderlist.push({'id':$scope.items[i].id,
                            'display_order':len-i});            
        }
        var cmd=JSON.stringify({'projectOrder':orderlist});
        console.log(cmd);
        $http({
            method:'POST',
            url:DataUrlService.backstage_url,
            headers:{'Content-Type': undefined},
            data:{
                cmd:cmd,               
            },
            transformRequest:function(data, headersGetter){
                var formData=new FormData();
                formData.append("active","setProjectOrder");            
                formData.append("projectOrder",data.cmd);
                           
                return formData;
            }
          
        }).success(function(data,status,headers,config){
            console.log(data);
            //update after success!            
            if(data.result==1){
                alert('Update Order Success!');
                $scope.reloadItem();
            }else
                alert("Update Order Fail!");
        });
        
    };

    $scope.moveOrder=function(index,dir){
        $scope.items.move(index,index+dir);
    };

    $scope.removeProject=function(pid){
        $http({
            method:'POST',
            url:DataUrlService.backstage_url,
            headers:{'Content-Type': undefined},
            data:{
                             
            },
            transformRequest:function(data, headersGetter){
                var formData=new FormData();
                formData.append("active","removeProject");
                formData.append("id",pid);
                           
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
    $scope.setPublish=function(pid,set_publish){
        console.log('publish '+pid+' '+set_publish);
        $http({
            method:'POST',
            url:DataUrlService.backstage_url,
            headers:{'Content-Type': undefined},
            data:{
                              
            },
            transformRequest:function(data, headersGetter){
                var formData=new FormData();
                formData.append("active","setPublish");
                formData.append("id",pid);
                formData.append("isPublish",set_publish);
                return formData;
            }
          
        }).success(function(data,status,headers,config){
            console.log(data);
            //update after success!            
            if(data.result==1){
                alert("SetPublish Success!");
               $scope.reloadItem();
            }else alert("SetPublish Fail!");
        });
    };

    $scope.reloadItem=function(){        
        // $scope.items=PortfolioService.reloadData();      
        // console.log($scope.items);
         $window.location.reload();
    };

});

routerApp.controller('OverviewCtrl',function($scope,$stateParams,$http,$window,$sessionStorage,$cookies,TagService,DataUrlService,ProjectParamService){
   

    /* check login */
    // if(!$sessionStorage.loggedIn){        
    //     alert('Not logged in!');
    //     $scope.$state.go('login');    
    // }
    // $window.onbeforeunload=function(){
    //     $sessionStorage.$reset();
    // };
    if($cookies.get('artgitalBS')!='loggedIn'){
        alert('Not logged in!');
        $scope.$state.go('login');    
    }


    $scope.project={'overview':null,'detail':null,'id':null};
    
    $scope.thumb_flow={};
    $scope.title_flow={};
    $scope.logo_flow={};


    $scope.loading=false;


    if($stateParams.pid!==undefined){
        $scope.project.id=$stateParams.pid;
        $http.get(DataUrlService.p_url+$scope.project.id).success(function(data){
            $scope.project.overview=data.overview;    
            $scope.project.detail=data.detail;
        });
    }else{
          $scope.project.overview={'tag':[],'is_highlight':'0'};           
    }
    
    $scope.tags=TagService.getTags();

    $scope.correctPath=function(path){
        return DataUrlService.correct_image_url+path;
    };

    $scope.createProject=function(){

        $scope.loading=true;

        ProjectParamService.addProject($scope.project);
        console.log($scope.project);


        // if($stateParams.pid!==undefined){
        //     $scope.$state.go('project_detail',{pid:$scope.project.id});
        //     // console.log($scope.project);
        // }else{
        
        $scope.project.overview['id']=$scope.project.id;
        var cmd=JSON.stringify($scope.project.overview);
        console.log(cmd);


        $http({
            method:'POST',
            url:DataUrlService.backstage_url,
            headers:{'Content-Type': undefined},
            data:{
                cmd:cmd,
                logo_file:($scope.logo_flow.flow.files[0]!==undefined)?$scope.logo_flow.flow.files[0].file:null,
                title_file:($scope.title_flow.flow.files[0]!==undefined)?$scope.title_flow.flow.files[0].file:null,
                thumb_file:($scope.thumb_flow.flow.files[0]!==undefined)?$scope.thumb_flow.flow.files[0].file:null
            },
            transformRequest:function(data, headersGetter){
                var formData=new FormData();
                if($scope.project.id!==null) formData.append("active","updateProject");
                else formData.append("active","addNewProject");

                formData.append("cmd",data.cmd);
                
                if($scope.logo_flow.flow.files[0]!==undefined) console.log('Update logo_file...');
                formData.append("logo",data.logo_file);
                
                if($scope.title_flow.flow.files[0]!==undefined) console.log('Update title_file...');
                formData.append("title",data.title_file);

                if($scope.thumb_flow.flow.files[0]!==undefined) console.log('Update thumb_file...');
                formData.append("thumb",data.thumb_file);
          

                return formData;
            }
          
        }).success(function(data,status,headers,config){

            $scope.loading=false;
            console.log(data);

            if(data.id!==null && data.id!==undefined) $scope.project.id=data.id;
            
            if(data.result==1){
                $scope.$state.go('project_detail',{pid:$scope.project.id});

                /* encode image for preview if update just now */
                if($scope.logo_flow.flow.files[0]!==undefined){
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL($scope.logo_flow.flow.files[0].file);
                    fileReader.onload=function(event){
                        $scope.project.overview.logo_image=event.target.result;
                    };                    
                }else $scope.project.overview.logo_image=$scope.correctPath($scope.project.overview.logo_image);
                
                if($scope.thumb_flow.flow.files[0]!==undefined){
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL($scope.thumb_flow.flow.files[0].file);
                    fileReader.onload=function(event){
                        $scope.project.overview.thumb_image=event.target.result;
                    };                    
                }else $scope.project.overview.thumb_image=$scope.correctPath($scope.project.overview.thumb_image);
                
                if($scope.title_flow.flow.files[0]!==undefined){
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL($scope.title_flow.flow.files[0].file);
                    fileReader.onload=function(event){
                        $scope.project.overview.title_image=event.target.result;
                    };                   
                }else $scope.project.overview.title_image=$scope.correctPath($scope.project.overview.title_image);
                             
            }
            else alert("Upload Fail!");
        });

        // }
    };


});

routerApp.controller('DetailCtrl',function($scope,$stateParams,$http,$window,$sessionStorage,$cookies,$timeout,
                                            DataUrlService,ProjectParamService,VideoTypeService){
    
    /* check login */
    // if(!$sessionStorage.loggedIn){        
    //     alert('Not logged in!');
    //     $scope.$state.go('login');    
    // }
    // $window.onbeforeunload=function(){
    //     $sessionStorage.$reset();
    // };
    if($cookies.get('artgitalBS')!='loggedIn'){
        alert('Not logged in!');
        $scope.$state.go('login');    
    }


    $scope.project=ProjectParamService.findById($stateParams.pid)[0];  
    /* fill-out image urls */
    $timeout(function(){
        if($scope.project===undefined) return;
        if($scope.project.detail==null){
            $scope.project.detail=[{"type":"text","title":"","text":""}];
            return;
        }
        var len=$scope.project.detail.length;
        for(var i=0;i<len;++i){
          if($scope.project.detail[i].type=='image_1'){
            $scope.project.detail[i].image_src=DataUrlService.correct_image_url+$scope.project.detail[i].image_src;
          }else if($scope.project.detail[i].type=='image_2'){
            $scope.project.detail[i].image_src_1=DataUrlService.correct_image_url+$scope.project.detail[i].image_src_1;
            $scope.project.detail[i].image_src_2=DataUrlService.correct_image_url+$scope.project.detail[i].image_src_2;
          }
        }
    },10);


    $scope.loading=false;


    $scope.videoHost=VideoTypeService.getVideoHost();

    $scope.decodeVideoUrl=function(url,sub){
        if(url.length>0){
            var vinfo=VideoTypeService.decodeVideoUrl(url);
            // console.log(vinfo);
            sub.vtype=vinfo.type;
            sub.vid=vinfo.id;
            // console.log(sub);
        }
    };

    $scope.mImg=0;
    $scope.imgFlow={};
    $scope.createImgId=function(){
        $scope.mImg++;        
        return 'img_'+$scope.mImg.toString();
    };
    $scope.addImgId=function(index,type){
        if(type==1){
            var iid=$scope.createImgId();
            $scope.project.detail[index]['img_tag']=iid;
            $scope.imgFlow[iid]={};
        }else if(type==2){
            var iid1=$scope.createImgId();
            var iid2=$scope.createImgId();
            $scope.project.detail[index]['img_tag1']=iid1;
            $scope.project.detail[index]['img_tag2']=iid2;
            $scope.imgFlow[iid1]={};
            $scope.imgFlow[iid2]={};
        }
    };

    $http.get('data/content_tag.json').success(function(data){
        $scope.contentType=data;
    });

    $scope.getTypeName=function(tag_en){
        if(typeof contentType!=='undefined') return $scope.contentType[tag_en];
    };


    
    $scope.addContent=function(type){
        switch(type){
            case 'text':
                $scope.project.detail.push({"type":type,"title":"","text":""});
                break;
            case 'image_1':
                // var iid=$scope.createImgId();
                $scope.project.detail.push({"type":type,"image_src":"","img_tag":""});
                // $scope.imgFlow[iid]={};
                break;
            case 'image_2':
                // var iid1=$scope.createImgId();
                // var iid2=$scope.createImgId();
                $scope.project.detail.push({"type":type,"image_src_1":"","img_tag1":"",
                                            "image_src_2":"","img_tag2":""});
                // $scope.imgFlow[iid1]={};
                // $scope.imgFlow[iid2]={};
                break;
            case 'video':
                $scope.project.detail.push({"type":type,"video_src":"","vtype":"","vid":""});
                break;            
            default:  
                $scope.project.detail.push({"type":type});
                break;     
        }
    };
    $scope.removeContent=function(index){
       $scope.project.detail.splice(index,1);        
    };
    $scope.moveContent=function(index,dir){
        $scope.project.detail.move(index,index+dir);
    };




    //  $scope.correctPath=function(path){
    //     return  DataUrlService.image_correct_url+path;
    // };

   

    $scope.goPreview=function(){
        ProjectParamService.updateProject($scope.project.id,$scope.project);

        //console.log($scope.imgFlow);

        var imgflow={};
        for(var k in $scope.imgFlow){
            if($scope.imgFlow[k].flow===undefined) continue;
            if($scope.imgFlow[k].flow.files[0]===undefined) continue;

            console.log(k+' '+$scope.imgFlow[k].flow.files[0].name);
            imgflow[k]=$scope.imgFlow[k].flow.files[0].file;
        }
        

        //encode images just uploaded
        // var len=$scope.project.detail.length;
        // for(var i=0;i<len;++i){
        //     if($scope.project.detail[i].type=="image_2"){
        //         var tag1=$scope.project.detail[i].img_tag1;
        //         if(tag1!==undefined && $scope.imgFlow[tag1]!==undefined){
        //             console.log("encode image2_1");
        //             var fileReader = new FileReader();
        //             var index=i;
        //             fileReader.readAsDataURL($scope.imgFlow[tag1].flow.files[0].file);
        //             fileReader.onload=function(event){
        //                 $scope.project.detail[index].image_src_1=event.target.result;
        //                 console.log($scope.project.detail[index].image_src_1);
        //             };
        //         }else
        //             $scope.project.detail[i].image_src_1=$scope.correctPath($scope.project.detail[i].image_src_1);
        //     }
        // }


        ProjectParamService.updateImageFlow(imgflow);

        $scope.$state.go('project_preview',{pid:$scope.project.id});
        // var url=$scope.$state.href('project_preview',{pid:$scope.project.id},{absolute:true});
        // console.log(url);
        // $window.open(url,'_blank');
    };
  

});    

routerApp.controller('PreviewCtrl',function($scope,$stateParams,$http,$window,$document,$timeout,$sessionStorage,$cookies,
                TagService,ProjectParamService,VideoTypeService,DataUrlService){
    

    /* check login */
    // if(!$sessionStorage.loggedIn){        
    //     alert('Not logged in!');
    //     $scope.$state.go('login');    
    // }
    // $window.onbeforeunload=function(){
    //     $sessionStorage.$reset();
    // };
    if($cookies.get('artgitalBS')!='loggedIn'){
        alert('Not logged in!');
        $scope.$state.go('login');    
    }



    $scope.templateUrl="../partial/detail.html";

    $scope.project=ProjectParamService.findById($stateParams.pid)[0];
    console.log($scope.project);

    $scope.loading=false;

    // $scope.correctPath=function(path){
    //     return DataUrlService.correct_url+path;
    // };

    $scope.textList=[];

    $timeout(function(){
        var len=$scope.project.detail.length;
        $scope.imgFlow=ProjectParamService.getImageFlow();

        for(var i=0;i<len;++i){

            //console.log(i);

          if($scope.project.detail[i].type=='text') $scope.textList.push($scope.project.detail[i].title);
          else if($scope.project.detail[i].type=="image_1"){
            var tag=$scope.project.detail[i].img_tag;
            if(tag!==undefined && $scope.imgFlow[tag]!==undefined){

                var fileReader = new FileReader();
                var index=i;
                fileReader.readAsDataURL($scope.imgFlow[tag]);
                fileReader.onload=function(event){
                    $scope.project.detail[index].image_src=event.target.result;                
                };

            }//else
                // $scope.project.detail[i].image_src=$scope.correctPath($scope.project.detail[i].image_src);
             
          } 
          else if($scope.project.detail[i].type=="image_2"){
            var tag1=$scope.project.detail[i].img_tag1;
            if(tag1!==undefined && $scope.imgFlow[tag1]!==undefined){
                console.log("encode image2_1");
                var fileReader = new FileReader();
                var index=i;
                fileReader.readAsDataURL($scope.imgFlow[tag1]);
                fileReader.onload=function(event){
                    $scope.project.detail[index].image_src_1=event.target.result;
                };
            }//else
                // $scope.project.detail[i].image_src_1=$scope.correctPath($scope.project.detail[i].image_src_1);

            var tag2=$scope.project.detail[i].img_tag2;
            if(tag2!==undefined && $scope.imgFlow[tag2]!==undefined){
                console.log("encode image2_2");
                var fileReader = new FileReader();
                var index=i;
                fileReader.readAsDataURL($scope.imgFlow[tag2]);
                fileReader.onload=function(event){
                    $scope.project.detail[index].image_src_2=event.target.result;
                };
            }//else
                //$scope.project.detail[i].image_src_2=$scope.correctPath($scope.project.detail[i].image_src_2);

          }
        }
    },500);

    // $scope.project.overview.logo_image=$scope.correctPath($scope.project.overview.logo_image);
    // $scope.project.overview.thumb_image=$scope.correctPath($scope.project.overview.thumb_image);
    // $scope.project.overview.title_image=$scope.correctPath($scope.project.overview.title_image);


    $scope.getTagNameList=function(tag_list){

        if(tag_list==undefined) return;

        var tlist='';
        var len=tag_list.length;
        for(var i=0;i<len;++i)
            tlist+=TagService.getTagName(tag_list[i]).ch+' ';

        return tlist; 
    };
    $scope.saveDetail=function(){

        $scope.loading=true;

        var cmdObject={'id':$scope.project.id,
                        'detail':$scope.project.detail};
        var img_file={};
       // var imgFlow=ProjectParamService.getImageFlow();
        // console.log(imgFlow);

        var dlen=cmdObject.detail.length;
        for(var i=0;i<dlen;++i){
            cmdObject.detail[i]['display_order']=(i+1);
            switch(cmdObject.detail[i]['type']){
                case 'video':
                    cmdObject.detail[i]['video_src']=VideoTypeService.encodeVideoUrl(cmdObject.detail[i].vtype,cmdObject.detail[i].vid);
                    break;
                case 'image_1':
                    var tag=cmdObject.detail[i].img_tag;    
                    if(tag!==undefined && $scope.imgFlow!==undefined){                
                        img_file[tag]=$scope.imgFlow[tag];
                        cmdObject.detail[i]['image_src']='';
                    }
                    break;
                case 'image_2':
                    var tag1=cmdObject.detail[i].img_tag1;
                    if(tag1!==undefined && $scope.imgFlow!==undefined){
                        img_file[tag1]=$scope.imgFlow[tag1];
                        cmdObject.detail[i]['image_src_1']='';   
                    }

                    var tag2=cmdObject.detail[i].img_tag2;
                    if(tag2!==undefined && $scope.imgFlow!==undefined){
                        img_file[tag2]=$scope.imgFlow[tag2];
                        cmdObject.detail[i]['image_src_2']='';   
                    }
                    break;
            }
        }

        var cmd=JSON.stringify(cmdObject);    
        //console.log(cmd);

        var is_update=(cmd.search('eid')!=-1);

        //console.log(img_file);
        
        
        $http({
            method:'POST',
            url:DataUrlService.backstage_url,
            headers:{'Content-Type': undefined},
            data:{
                cmd:cmd,
                img_file:$scope.imgFlow                    
            },
            transformRequest:function(data, headersGetter){
                var formData=new FormData();
                if(is_update) formData.append("active","updateDetail");
                else formData.append("active","addNewDetail");

                formData.append("cmd",data.cmd);
               
                for(var fimg in data.img_file){
                    formData.append(fimg,data.img_file[fimg]);
                }

                return formData;
            }
          
        }).success(function(data,status,headers,config){
            console.log(data);
            $scope.loading=false;

            if(data.result==1)
                $scope.$state.go('project_list');
            else
                $window.alert("Upload Fail!");
        });
    };




});