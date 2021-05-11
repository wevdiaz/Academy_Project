const { encontrarIdade, encontrarData, escolhaDaFormacao, escolherModalidade } = require("../../lib/utils");
const intl = require("intl");

const db = require("../../config/db");
const teacher = require("../models/teacher");


module.exports = {
    index(req, res){
        let { filter, page, limit } = req.query;

        page = page || 1;
        limit = limit || 4;

        let offset = limit  * (page - 1);

        const params = {
            filter,
            page,
            limit,
            offset,
            callback(teachers){

                const teachersIndex = teachers.map(function(teacher){
                const teachersubjects = {
                    ...teacher,
                    subjects_taught: teacher.subjects_taught.split(",")
                }
        
                 return teachersubjects;
              });              

              const pagination = {
                total: Math.ceil(teachers[0].total / limit),
                page
              }           

                return res.render("teachers/index", { teachers: teachersIndex, pagination, filter })
            }
        }

        teacher.paginate(params);    
                
    },
    show(req, res){
        
        teacher.find(req.params.id, function(teacher){
            if (!teacher) return res.send("Teacher not found!");

            teacher.age = encontrarIdade(teacher.birth_date);
            teacher.subjects_taught = teacher.subjects_taught.split(",");
            teacher.created_at = encontrarData(teacher.created_at).format;
            teacher.education_level = escolhaDaFormacao(teacher.education_level);
            teacher.class_type = escolherModalidade(teacher.class_type);

            return res.render("teachers/show", { teacher });
        });
    },
    create(req, res){
        return res.render("teachers/create");
    },
    post(req, res){

        const keys = Object.keys(req.body);

        for (key of keys) {
        
            if (req.body[key] == "") {
                return res.send("Campo em branco, preencha!");
            }
        } 
        
        teacher.create(req.body, function(teacher){
            return res.redirect(`/teachers/${teacher.id}`);
        });
        
    },
    edit(req, res){
        
        teacher.find(req.params.id, function(teacher){
            if (!teacher) res.send("Teacher not found!");

            teacher.birth_date = encontrarData(teacher.birth_date).iso;

            return res.render("teachers/edit", { teacher });
        });
    },
    put(req, res){

        const keys = Object.keys(req.body);

        for (key of keys) {
        
            if (req.body[key] == "") {
                return res.send("Campo em branco, preencha!");
            }
        }

        teacher.update(req.body, function(){
            return res.redirect(`/teachers/${req.body.id}`);
        });   
    },
    delete(req, res){
        
        teacher.delete(req.body.id, function() {
            return res.redirect("/teachers");
        });
    },
}
