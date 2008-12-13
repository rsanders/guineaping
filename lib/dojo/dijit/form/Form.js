/*
	Copyright (c) 2004-2008, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["dijit.form.Form"]){
dojo._hasResource["dijit.form.Form"]=true;
dojo.provide("dijit.form.Form");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.declare("dijit.form._FormMixin",null,{reset:function(){
dojo.forEach(this.getDescendants(),function(_1){
if(_1.reset){
_1.reset();
}
});
},validate:function(){
var _2=false;
return dojo.every(dojo.map(this.getDescendants(),function(_3){
_3._hasBeenBlurred=true;
var _4=_3.disabled||!_3.validate||_3.validate();
if(!_4&&!_2){
dijit.scrollIntoView(_3.containerNode||_3.domNode);
_3.focus();
_2=true;
}
return _4;
}),function(_5){
return _5;
});
},setValues:function(_6){
dojo.deprecated(this.declaredClass+"::setValues() is deprecated. Use attr('value', val) instead.","","2.0");
return this.attr("value",_6);
},_setValueAttr:function(_7){
var _8={};
dojo.forEach(this.getDescendants(),function(_9){
if(!_9.name){
return;
}
var _a=_8[_9.name]||(_8[_9.name]=[]);
_a.push(_9);
});
for(var _b in _8){
if(!_8.hasOwnProperty(_b)){
continue;
}
var _c=_8[_b],_d=dojo.getObject(_b,false,_7);
if(_d===undefined){
continue;
}
if(!dojo.isArray(_d)){
_d=[_d];
}
if(typeof _c[0].checked=="boolean"){
dojo.forEach(_c,function(w,i){
w.attr("value",dojo.indexOf(_d,w.value)!=-1);
});
}else{
if(_c[0]._multiValue){
_c[0].attr("value",_d);
}else{
dojo.forEach(_c,function(w,i){
w.attr("value",_d[i]);
});
}
}
}
},getValues:function(){
dojo.deprecated(this.declaredClass+"::getValues() is deprecated. Use attr('value') instead.","","2.0");
return this.attr("value");
},_getValueAttr:function(){
var obj={};
dojo.forEach(this.getDescendants(),function(_13){
var _14=_13.name;
if(!_14||_13.disabled){
return;
}
var _15=_13.attr("value");
if(typeof _13.checked=="boolean"){
if(/Radio/.test(_13.declaredClass)){
if(_15!==false){
dojo.setObject(_14,_15,obj);
}
}else{
var ary=dojo.getObject(_14,false,obj);
if(!ary){
ary=[];
dojo.setObject(_14,ary,obj);
}
if(_15!==false){
ary.push(_15);
}
}
}else{
dojo.setObject(_14,_15,obj);
}
});
return obj;
},isValid:function(){
return dojo.every(this.getDescendants(),function(_17){
return _17.disabled||!_17.isValid||_17.isValid();
});
},onValidStateChange:function(_18){
},_widgetChange:function(){
var _19=this.isValid();
if(_19!==this._lastValidState){
this._lastValidState=_19;
this.onValidStateChange(_19);
}
},connectChildren:function(){
dojo.forEach(this._changeConnections,dojo.hitch(this,"disconnect"));
var _1a=this;
this._changeConnections=dojo.map(dojo.filter(this.getDescendants(),function(_1b){
return _1b.validate;
}),function(_1c){
return _1a.connect(_1c,"validate","_widgetChange");
});
this._widgetChange();
},startup:function(){
this.inherited(arguments);
this._changeConnections=[];
this.connectChildren();
this._lastValidState=this.isValid();
}});
dojo.declare("dijit.form.Form",[dijit._Widget,dijit._Templated,dijit.form._FormMixin],{name:"",action:"",method:"",encType:"","accept-charset":"",accept:"",target:"",templateString:"<form dojoAttachPoint='containerNode' dojoAttachEvent='onreset:_onReset,onsubmit:_onSubmit' name='${name}'></form>",attributeMap:dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap),{action:"",method:"",encType:"","accept-charset":"",accept:"",target:""}),execute:function(_1d){
},onExecute:function(){
},_setEncTypeAttr:function(_1e){
this.encType=_1e;
dojo.attr(this.domNode,"encType",_1e);
if(dojo.isIE){
this.domNode.encoding=_1e;
}
},postCreate:function(){
if(dojo.isIE&&this.srcNodeRef&&this.srcNodeRef.attributes){
var _1f=this.srcNodeRef.attributes.getNamedItem("encType");
if(_1f&&!_1f.specified&&(typeof _1f.value=="string")){
this.attr("encType",_1f.value);
}
}
this.inherited(arguments);
},onReset:function(e){
return true;
},_onReset:function(e){
var _22={returnValue:true,preventDefault:function(){
this.returnValue=false;
},stopPropagation:function(){
},currentTarget:e.currentTarget,target:e.target};
if(!(this.onReset(_22)===false)&&_22.returnValue){
this.reset();
}
dojo.stopEvent(e);
return false;
},_onSubmit:function(e){
var fp=dijit.form.Form.prototype;
if(this.execute!=fp.execute||this.onExecute!=fp.onExecute){
dojo.deprecated("dijit.form.Form:execute()/onExecute() are deprecated. Use onSubmit() instead.","","2.0");
this.onExecute();
this.execute(this.getValues());
}
if(this.onSubmit(e)===false){
dojo.stopEvent(e);
}
},onSubmit:function(e){
return this.isValid();
},submit:function(){
if(!(this.onSubmit()===false)){
this.containerNode.submit();
}
}});
}
