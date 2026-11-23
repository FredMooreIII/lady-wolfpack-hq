// Lady Wolfpack HQ -- player roster + season stats. Edit this file for roster/stat changes.
const ROSTER = [
    {n:55,name:"Adde Zuck",pos:"G",r:false,photo:null,g:0,a:0,pts:0,gp:5,appg:0.0,pim:0},
    {n:21,name:"Ana Straker",pos:"G",r:false,photo:null,g:0,a:0,pts:0,gp:4,appg:0.0,pim:0},
    {n:2,name:"Bailey Moore",pos:"D",r:true,photo:null,g:0,a:0,pts:0,gp:5,appg:0.0,pim:0},
    {n:23,name:"Bailey Pelletier",pos:"F",r:false,photo:null,g:0,a:1,pts:1,gp:5,appg:0.25,pim:0},
    {n:22,name:"Emma Zhang",pos:"F",r:false,photo:null,g:1,a:0,pts:1,gp:5,appg:0.25,pim:0},
    {n:15,name:"Evangeline Zhang",pos:"D",r:false,photo:null,g:0,a:0,pts:0,gp:5,appg:0.0,pim:0},
    {n:77,name:"Eve Krause",pos:"F",r:false,photo:null,g:0,a:1,pts:1,gp:5,appg:0.25,pim:0},
    {n:91,name:"Hailey Reilly",pos:"D",r:false,photo:null,g:0,a:0,pts:0,gp:5,appg:0.0,pim:0},
    {n:16,name:"Khloe Starkey",pos:"F",r:true,photo:null,g:0,a:0,pts:0,gp:5,appg:0.0,pim:0},
    {n:20,name:"Lizzie Melchiorre",pos:"F",r:true,photo:null,g:0,a:0,pts:0,gp:2,appg:0.0,pim:0},
    {n:82,name:"Mairead Hornish",pos:"F",r:false,photo:null,g:2,a:0,pts:2,gp:5,appg:0.5,pim:1},
    {n:12,name:"Nia Lorenzi",pos:"D",r:false,photo:null,g:0,a:0,pts:0,gp:5,appg:0.0,pim:0},
    {n:8,name:"Olivia Schortman",pos:"D",r:false,photo:null,g:0,a:0,pts:0,gp:4,appg:0.0,pim:0},
    {n:97,name:"Rory Malone",pos:"F",r:false,photo:null,g:0,a:0,pts:0,gp:5,appg:0.0,pim:0},
    {n:6,name:"Whitney Noe",pos:"F",r:true,photo:null,g:0,a:0,pts:0,gp:5,appg:0.0,pim:0},
    {n:36,name:"Mackenzie Moore",pos:"F",r:true,photo:null,g:0,a:0,pts:0,gp:4,appg:0.0,pim:0},
  ].sort((a,b)=> a.name.trim().split(/\s+/).pop().localeCompare(b.name.trim().split(/\s+/).pop()) || a.name.localeCompare(b.name));
