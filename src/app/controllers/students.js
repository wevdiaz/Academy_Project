const { encontrarData, grade } = require("../../lib/utils");
const intl = require("intl");

const db = require("../../config/db");
const student = require("../models/student");


module.exports = {
    index(req, res){

        let { filter, page, limit } = req.query;

        page = page || 1;
        limit = limit || 4;

        let offset = limit * (page - 1);

        const params = {
            filter,
            page,
            limit,
            offset,
            callback(students) {

                const studentsIndex = students.map(function(student){
                    const spreadStudent = {
                        ...student,
                        grade: grade(student.grade)
                    }
                    return spreadStudent;
                });

                const pagination = {
                    total: Math.ceil(students[0].total / limit),
                    page
                }

                return res.render("students/index", { students: studentsIndex, pagination, filter });
            }
        }
        
        student.paginate(params);     
                
    },
    show(req, res){
        
        student.find(req.params.id, function(student){
            if (!student) return res.send("Student not found!");

            student.birth_date = encontrarData(student.birth_date).birthDay;
            student.grade = grade(student.grade);

            return res.render("students/show", { student });
        });
    },
    create(req, res){
       student.teachersSelectOptions(function(options){
           return res.render("students/create", { teacherOptions: options });
       });
    },
    post(req, res){

        const keys = Object.keys(req.body);

        for (key of keys) {
        
            if (req.body[key] == "") {
                return res.send("Campo em branco, preencha!");
            }
        } 
        
        student.create(req.body, function(student){
            return res.redirect(`/students/${student.id}`);
        });
        
    },
    edit(req, res){
        
        student.find(req.params.id, function(Student){
            if (!Student) res.send("Student not found!");

            Student.birth_date = encontrarData(Student.birth_date).iso;

            student.teachersSelectOptions(function(options){

                return res.render("students/edit", { Student, teacherOptions: options });
            });

        });
    },
    put(req, res){

        const keys = Object.keys(req.body);

        for (key of keys) {
        
            if (req.body[key] == "") {
                return res.send("Campo em branco, preencha!");
            }
        }

        student.update(req.body, function(){
            return res.redirect(`/students/${req.body.id}`);
        });   
    },
    delete(req, res){
        
        student.delete(req.body.id, function() {
            return res.redirect("/students");
        });
    },
}


