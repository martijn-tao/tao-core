/**
 * UiForm class enable you to manage form elements, initialize form component and bind common events
 * 
 * @require jquery >= 1.3.2 [http://jquery.com/]
 * @require UiBootstrap [uiBootstrap.js]
 * @require [helpers.js]
 * 
 * @author Bertrand Chevrier, <bertrand.chevrier@tudor.lu>
 */ 
var counter = 0;
UiForm = function(){
	
	/**
	 * to access the context 
	 */
	var formInstance = this;
	
	/*
	 * Patterns used to initialize the form   
	 */
	
	this.initFormPattern = new RegExp(['search', 'authoring', 'Import', 'Export', 'IO', 'preview'].join('|'));
	this.initGenerisFormPattern =  new RegExp(['add', 'edit'].join('|'), 'i');
	this.initTranslationFormPattern = /translate/;
	
	
	/**
	 * manual contructor
	 */
	this._init = function(){
		
		this.initNav();
		
		if(UiBootstrap == undefined){
			UiBootstrap.tabs = $("#tabs");
		}
		
		$("body").ajaxComplete(function(event, request, settings){
			
			//initialize regarding the requested action 
			
			//async request waiting for html or not defined
			if(settings.dataType == 'html' || settings.dataType == undefined){
				if(settings.url.indexOf('?') != -1 ){
					testedUrl = settings.url.substr(0, settings.url.indexOf('?'));
				}
				else{
					testedUrl = settings.url;
				}
				
				formInstance.initRendering();
				
				if(formInstance.initGenerisFormPattern.test(testedUrl)){
					formInstance.initElements();
					formInstance.initOntoForms();
				}
				else if (formInstance.initFormPattern.test(testedUrl)) {
					formInstance.initElements();
				}
				else if(formInstance.initTranslationFormPattern.test(testedUrl)){
					formInstance.initElements();
					formInstance.initTranslationForm();
				}
			}
		});
		this.initRendering();
	};
	
	/**
	 * init form naviguation (submit by ajax)
	 */
	this.initNav = function(){
		$("form").live('submit', function(){
			return formInstance.submitForm($(this));
		});
	};
	
	/**
	 * make some adjustment on the forms
	 */
	this.initRendering = function(){
		$("span.form_desc").each(function(){
			var myHeight = parseInt($(this).height());
			var parentHeight = parseInt($(this).parent().height());
			if(myHeight > parentHeight){
				$(this).parent().height(myHeight +'px');
			}
		});
	};
	
	this.initElements = function(){

		$(getMainContainerSelector(UiBootstrap.tabs)+ " form :input:not(:hidden):not(button):first").focus();
		
		
		//save form button
		$(".form-submiter").click(function(){
			
			myForm = $(this).parents("form");
			if(formInstance.submitForm(myForm)){
				myForm.submit();
			}
			return false;
		});
	
		//revert form button
		$(".form-reverter").click(function(){
			
			if ($("#uri").val() != undefined) {
				GenerisTreeClass.selectTreeNode($("#uri").val());
			}
			else if ($("#classUri").val() != undefined) {
					GenerisTreeClass.selectTreeNode($("#classUri").val());
			}
		});
		
		//translate button
		$(".form-translator").click(function(){
			if($("#uri") && $("#classUri")){
				if(ctx_extension){
					url = root_url + '/' + ctx_extension + '/' + ctx_module + '/';
				}
				url += 'translateInstance';
				$(getMainContainerSelector(UiBootstrap.tabs)).load(url, {'uri': $("#uri").val(), 'classUri': $("#classUri").val()});
			}
			return false;
		});
		
		//map the wysiwyg editor to the html-area fields
		$('.html-area').each(function(){
			if ($(this).css('display') != 'none') {
				$(this).wysiwyg({'css' : taobase_www + 'css/layout.css'});
			}
		});
		
		$('.box-checker').click(function(){
			
			var checker  = $(this);
			var regexpId = new RegExp('^'+checker.attr('id').replace('_checker', ''), 'i');
			
			if(checker.hasClass('box-checker-uncheck')){
				$(":checkbox").each(function(){
					if(regexpId.test(this.id)){
						this.checked = false;
					}
				});
				checker.removeClass('box-checker-uncheck');
				checker.text(__('Check all'));
			}
			else{
				$(":checkbox").each(function(){
					if(regexpId.test(this.id)){
						this.checked = true;
					}
				});
				checker.addClass('box-checker-uncheck');
				checker.text(__('Uncheck all'));
			}
			
			return false;
		});
		
		//map the imageable / fileable elements to the filemanager plugin
		$('.imageable').fmbind({type: 'image'}, function(elt, value){
			$(elt).val(value);
		});
		$('.fileable').fmbind({
			type: 'file'
		});
	};
	
	/**
	 * init special forms controls
	 */
	this.initOntoForms = function (){
		
		//open the authoring tool on the authoringOpener button
		$('input.authoringOpener').click(function(){
			if(ctx_extension){
			 	url = root_url + '/' + ctx_extension + '/' + ctx_module + '/';
				tabName = ctx_module.toLowerCase() + '_authoring';
			 }
			url += 'authoring';
			index = getTabIndexByName(tabName);
			if(index > -1){
				if($("#uri") && $("#classUri")){
					UiBootstrap.tabs.tabs('url', index, url + '?uri=' + $("#uri").val() +'&classUri=' + $("#classUri").val());
					UiBootstrap.tabs.tabs('enable', index);
					UiBootstrap.tabs.tabs('select', index);
				}
			}
		});
		
		$('input.editVersionedFile').each(function(){
			
			var infoUrl = root_url + '/tao/File/getPropertyFileInfo';
			var data = {
				'uri':$("#uri").val(),
				'propertyUri':$(this).siblings('label.form_desc').attr('for')
			};
			var $_this = $(this);
			$.ajax({
			   type: "GET",
			   url: infoUrl,
			   data: data,
			   dataType: 'json',
			   success: function(r){
					$_this.after('<span>'+r.name+'</span>');
			   }
			});
			
		});
		
		$('input.editVersionedFile').click(function(){
			var url = '';
			if(ctx_extension){
				url = root_url + '/' + ctx_extension + '/' + ctx_module + '/';
			}
			url += 'editVersionedFile';
			var data = {
				'uri':$("#uri").val(),
				'propertyUri':$(this).siblings('label.form_desc').attr('for')
			};
			
			if(UiBootstrap.tabs.size() == 0){
				if($('div.main-container').length){
						$('div.main-container').load(url, data);
				}
			}
			$(getMainContainerSelector(UiBootstrap.tabs)).load(url, data);
			return false;
		});
		/**
		 * remove a form group, ie. a property
		 */
		function removeGroup(){
			if (confirm(__('Please confirm property deletion!'))) {
				groupNode = $(this).parents(".form-group").get(0);
				if (groupNode) {
					$(groupNode).remove();
				}
			}
		}
		
		//property form group controls
		$('.form-group').each(function(){
			var formGroup = $(this);
			if(/property\_[0-9]+$/.test(formGroup.attr('id'))){
				var child = formGroup.children("div:first");
				
				toggelerClass = 'ui-icon-circle-triangle-s';
				if(!formGroup.hasClass('form-group-opened')){
					child.hide();
					toggelerClass = 'ui-icon-circle-triangle-e';
				}
				
				//toggle controls: plus/minus icon
				toggeler = $("<span class='form-group-control ui-icon' title='expand' style='right:48px;'></span>");			
				toggeler.addClass(toggelerClass);
				toggeler.click(function(){
					var control = $(this);
					if(child.css('display') == 'none'){
						child.show('slow');
						control.removeClass('ui-icon-circle-triangle-e');
						control.addClass('ui-icon-circle-triangle-s');
						control.attr('title', 'hide property');
					}
					else{
						child.hide('slow');
						control.removeClass('ui-icon-circle-triangle-s');
						control.addClass('ui-icon-circle-triangle-e');
						control.attr('title', 'show property');
					}
				});
				formGroup.prepend(toggeler);
				
				//delete control
				if (/^property\_[0-9]+/.test(formGroup.attr('id'))) {
					deleter = $("<span class='form-group-control ui-icon ui-icon-circle-close' title='Delete' style='right:24px;'></span>");
					deleter.click(removeGroup);
					formGroup.prepend(deleter);
				}
			}
		});
		
		//property delete button 
		 $(".property-deleter").click(removeGroup);
		 
		 //property add button
		 $(".property-adder").click(function(){
			 if(ctx_extension){
			 	url = root_url + '/' + ctx_extension + '/' + ctx_module + '/';
			 }
			 url += 'addClassProperty';
			 
			 GenerisAction.addProperty (null,  $("#classUri").val(), url);
		 });
		 $(".property-mode").click(function(){
			 mode = 'simple';
			 if($(this).hasClass('property-mode-advanced')){
				mode = 'advanced';
			}
			url = $(this).parents('form').attr('action');
		
			$(getMainContainerSelector(UiBootstrap.tabs)).load(url, {
				'property_mode': mode,
				'uri': $("#uri").val(),
				'classUri': $("#classUri").val()
			});
			return false;
		 });
		 
		 /**
		  * display or not the list regarding the property type
		  */
		 function showPropertyList(){
		 	var elt = $(this).parent("div").next("div");
			if(/list$/.test($(this).val())){
				if(elt.css('display') == 'none'){
					elt.show();
					elt.find('select').removeAttr('disabled');
				}
			}
			else if(elt.css('display') != 'none'){
				elt.css('display', 'none');
				elt.find('select').attr('disabled', "disabled");
			}
		 }
		 
		 /**
		  * by selecting a list, the values are displayed or the list editor opens
		  */
		 function showPropertyListValues(){
		 	
			if($(this).val() == 'new'){
			
				/*
				 * Open the list editor: a tree in a dialog popup 
				 */
				var rangeId = $(this).attr('id');
				var dialogId = rangeId.replace('_range', '_dialog');
				var treeId = rangeId.replace('_range', '_tree');
				var closerId = rangeId.replace('_range', '_closer');
				
				//dialog content to embed the list tree
				elt = $(this).parent("div");
				elt.append("<div id='"+ dialogId +"' style='display:none;' > " +
								"<span class='ui-state-highlight' style='margin:15px;'>" + __('Right click the tree to manage your lists') + "</span><br /><br />" +
								"<div id='"+treeId+"' ></div> " +
								"<div style='text-align:center;margin-top:30px;'> " +
									"<a id='"+closerId+"' class='ui-state-default ui-corner-all' href='#'>" + __('Save') + "</a> " +
								"</div> " +
							"</div>");
							
				//init dialog events
				$("#"+dialogId).dialog({
					width: 350,
					height: 400,
					autoOpen: false,
					title: __('Manage data list')
				});
				
				//destroy dialog on close
				$("#"+dialogId).bind('dialogclose', function(event, ui){
					$.tree.reference("#"+treeId).destroy();
					$("#"+dialogId).dialog('destroy');
					$("#"+dialogId).remove();
				});
				$("#"+closerId).click(function(){
					$("#"+dialogId).dialog('close');
				});
				$("#"+dialogId).bind('dialogopen', function(event, ui){
					url 			= root_url + '/tao/Lists/';
					dataUrl 		= url + 'getListsData';
					renameUrl		= url + 'rename';
					createUrl		= url + 'create';
					removeListUrl	= url + 'removeList';
					removeListEltUrl= url + 'removeListElement';
					
					//create tree to manage lists
					var generisTreeInstance = $("#"+treeId).tree({
						data: {
							type: "json",
							async : true,
							opts: {
								method : "POST",
								url: dataUrl
							}
						},
						types: {
						 "default" : {
								renameable	: true,
								deletable	: true,
								creatable	: true,
								draggable	: false
							}
						},
						ui: {
							theme_name : "custom"
						},
						callback: {
							onrename: function(NODE, TREE_OBJ, RB){
								options = {
									url: renameUrl,
									NODE: NODE,
									TREE_OBJ: TREE_OBJ
								};
								if($(NODE).hasClass('node-instance')){
									PNODE = TREE_OBJ.parent(NODE);
									options.classUri = $(PNODE).attr('id');
								}
								
								/**
								 * Model changed, the function are not anymore static.
								 * please call renameNode on the instance of Generis Class
								 * Note : Use a GenerisTree function on a JQuery Tree ... strange
								 */
								
								GenerisTreeClass.renameNode(options);
							},
							ondestroy: function(TREE_OBJ){
								
								//empty and build again the list drop down on tree destroying
								$("#"+rangeId+" option").each(function(){
									if($(this).val() != "" && $(this).val() != "new"){
										$(this).remove();
									}
								});
								$("#"+treeId+" .node-root .node-class").each(function(){
									$("#"+rangeId+" option[value='new']").before("<option value='"+$(this).attr('id')+"'>"+$(this).children("a:first").text()+"</option>");
								});
								$("#"+rangeId).parent("div").children("ul.form-elt-list").remove();
								$("#"+rangeId).val('');
							}
						},
						plugins: {
							//tree right click menu
							contextmenu: {
								items: {
									
									//create a new list or a list item
									create: {
										label: __("Create"),
										icon	: taobase_www + "img/add.png",
										visible: function(NODE, TREE_OBJ){
											if($(NODE).hasClass('node-instance')){
												return false; 
											}
											return TREE_OBJ.check("creatable", NODE);
										},
										action  : function(NODE, TREE_OBJ){
											if ($(NODE).hasClass('node-class')) {
												
												var cssClass = 'node-instance';
												$.ajax({
													url: 	createUrl,
													type: 	"POST",
													data: 	{classUri: $(NODE).attr('id'), type: 'instance'},
													dataType: 'json',
													success: function(response){
														if (response.uri) {
															TREE_OBJ.select_branch(TREE_OBJ.create({
																data: response.label,
																attributes: {
																	id: response.uri,
																	'class': cssClass
																}
															}, TREE_OBJ.get_node(NODE[0])));
														}
													}
												});
											}
											if ($(NODE).hasClass('node-root')) {
												//create list
												$.ajax({
													url: createUrl,
													type: "POST",
													data: {classUri: 'root', type: 'class'},
													dataType: 'json',
													success: function(response){
														if(response.uri){
															TREE_OBJ.select_branch(
																TREE_OBJ.create({
																	data: response.label,
																	attributes: {
																		id: response.uri,
																		'class': 'node-class'
																	}
																}, TREE_OBJ.get_node(NODE[0])));
														}
													}
												});
											}
											return false;
										}
									},
									
									//rename a node
									rename: {
										label: __("Rename"),
										icon	: taobase_www + "img/rename.png",
										visible: function(NODE, TREE_OBJ){
											if($(NODE).hasClass('node-root')){
												return false; 
											}
											return TREE_OBJ.check("renameable", NODE);
										}
									},
									
									//remove a node
									remove: {
										label: __("Remove"),
										icon	: taobase_www + "img/delete.png",
										visible: function(NODE, TREE_OBJ){
											if($(NODE).hasClass('node-root')){
												return false; 
											}
											return TREE_OBJ.check("deletable", NODE);
										},
										action  : function(NODE, TREE_OBJ){
											if($(NODE).hasClass('node-root')) {
												return false;
											}
											if($(NODE).hasClass('node-class')) {
												removeUrl = removeListUrl;
											}
											if($(NODE).hasClass('node-instance')) {
												removeUrl = removeListEltUrl;
											}
											//remove list
											$.ajax({
												url: removeUrl,
												type: "POST",
												data: {uri: $(NODE).attr('id')},
												dataType: 'json',
												success: function(response){
													if (response.deleted) TREE_OBJ.remove(NODE);
												}
											});
											return false;
										}
									}
								}
							}
						}
					});
				});
				
				//open the dialog window
				$("#"+dialogId).dialog('open');
			}
			else{
				
				//load the instances and display them (the list items)
				$(this).parent("div").children("ul.form-elt-list").remove();
				var classUri = $(this).val();
				if(classUri != ''){
					$(this).parent("div").children("div.form-error").remove();
					var elt = this;
					$.ajax({
						url: root_url + '/tao/Lists/getListElements',
						type: "POST",
						data: {classUri: classUri},
						dataType: 'json',
						success: function(response){
							html = "<ul class='form-elt-list'>";
							for(i in response){
								html += '<li>'+response[i]+'</li>';
							}
							html += '</ul>';
							$(elt).parent("div").append(html);
						}
					});
				}
			}
		 }
		 
		 //bind functions to the drop down:
		 
		 //display the values drop down regarding the selected type
		 $(".property-type").change(showPropertyList);
		 $(".property-type").each(showPropertyList);
		 
		 //display the values of the selected list
		 $(".property-listvalues").change(showPropertyListValues);
		 $(".property-listvalues").each(showPropertyListValues);
		 
		 //show the "green plus" button to manage the lists 
		 $(".property-listvalues").each(function(){
		 	var listField = $(this);
		 	if(listField.parent().find('img').length == 0){
				listControl = $("<img title='manage lists' style='cursor:pointer;' />");
				listControl.attr('src', imgPath + '/add.png');
				listControl.click(function(){
					listField.val('new');
					listField.change();
				});
				listControl.insertAfter(listField);
		 	}
		 });
		 
		 $(".property-listvalues").each(function(){
		 	elt = $(this).parent("div");
			if(!elt.hasClass('form-elt-highlight') && elt.css('display') != 'none'){
				elt.addClass('form-elt-highlight');
			}
		 });
	};
	
	/**
	 * controls of the translation forms 
	 */
	this.initTranslationForm = function(){
		$('#translate_lang').change(function(){
			trLang = $(this).val();
			if(trLang != ''){
				
				$("#translation_form :input").each(function(){
					if(/^http/.test($(this).attr('name'))){
						$(this).val('');
					}
				});
				
				if(ctx_extension){
				 	url = root_url + '/' + ctx_extension + '/' + ctx_module + '/';
				}
				url += 'getTranslatedData';
				
				$.post(
					url,
					{uri: $("#uri").val(), classUri: $("#classUri").val(), lang: trLang},
					function(response){
						for(index in response){
							var formElt = $(":input[name='"+index+"']");
							if(formElt.hasClass('html-area')){
								formElt.wysiwyg('setContent', response[index]);
							}
							else{
								formElt.val(response[index]);
							}
							
						}
					},
					'json'
				);
			}
		});
	};
	
	/**
	 * Ajax form submit -> post the form data and display back the form into the container
	 * @param myForm
	 * @return boolean
	 */
	this.submitForm = function(myForm){
		try {
			if(myForm.attr('enctype') == 'multipart/form-data' && myForm.find(".file-uploader").length) {
				return false;
			}
			else {
				if(UiBootstrap.tabs.size() == 0){
					if($('div.main-container').length){
							$('div.main-container').load(myForm.attr('action'), myForm.serializeArray());
					}else{
							return true;//go to the link
					}
				}else if(!$(getMainContainerSelector(UiBootstrap.tabs))){
					return true;//go to the link
				}
				$(getMainContainerSelector(UiBootstrap.tabs)).load(myForm.attr('action'), myForm.serializeArray());
			}
			window.location = '#form-title';
		} 
		catch (exp) {
			return false;
		}
		return false;
	};
	
	this._init();
};

/**
 * @var {UiForm} uiForm global instance
 */
var uiForm = null;
$(document).ready(function(){
	
	/**
	 * instanciate on load
	 */
	uiForm = new UiForm();
	
});
