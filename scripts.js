"use strict";

var student = function(config) {
    var self = this, data;

    data = $.extend({
        birthDate: "",
        index: "",
        name: "",
        lastName: ""
    }, config);

    ko.mapping.fromJS(data, {}, self);
};

var course = function(config) {
    var self = this, data;

    data = $.extend({
        name: "",
        lecturer: "",
        gradeList: ""
    }, config);

    ko.mapping.fromJS(data, {}, self);
};

var grade = function(config) {
    var self = this, data;
    var sub = {name: ""};
    var stu = {index: ""};

    data = $.extend({
        issueDate: "",
        value: "",
        index: "",
        subject: sub,
        student: stu
    }, config);

    ko.mapping.fromJS(data, {}, self);
};

function ViewModel() {
    var self = this;
    self.students = ko.observableArray([]);
    self.subjects = ko.observableArray([]);
    self.grades = ko.observableArray([]);
    self.currentGradeStudentIndex = {};
    self.studentsName = ko.observable('');
    self.studentsLastName = ko.observable('');
    self.studentsIndex = ko.observable('');
    self.studentsBirthDate = ko.observable('');
    self.gradesCourse = ko.observable('');
    self.gradesValue = ko.observable('');
    self.gradesDate = ko.observable('');
    
    self.getStudentFromObject = function(dataJSON) {
        var temp = {
            index : dataJSON.index,
            birthDate : dataJSON.birthDate,
            name: dataJSON.name,
            lastName: dataJSON.lastName
        }
        return temp;
    }
    
    self.getCourseFromObject = function(dataJSON) {
        var temp = {
            lecturer: dataJSON.lecturer,
            name: dataJSON.name
        }
        return temp;
    }
    
    self.getGradeFromObject = function(dataJSON) {   
        var studentData = {index:self.currentGradeStudentIndex}
        var subjectData = {name: dataJSON.subject.name}
        var temp = {
            issueDate: dataJSON.issueDate,
            value: dataJSON.value,
            index: dataJSON.index,
            subject: subjectData,
            student: studentData
        }
        return temp;
    }
    
    self.getStudents = function () {
            $.ajax({
            Accepts:"application/json",
            url: "http://localhost:8000/app/students"
        }).then(function(data) {
            self.students.removeAll();
            $.each(data, function() {
                self.students.push(ko.mapping.fromJS(this));
            });
                self.students.push(ko.mapping.fromJS(new student()));
        });
    };
    self.getStudents();
    
    self.addStudent = function() {
        var t = this;
        var dataJSON = self.students()[self.students().length - 1];
        var data = self.getStudentFromObject(dataJSON);
        dataJSON = ko.mapping.toJSON(data);
//        alert(dataJSON);
        var ur = "http://localhost:8000/app/students";
        $.ajax({
            contentType: "application/json; charset=utf-8",
            data: dataJSON, 
            url: ur, 
            type: "POST",
            success: function() { 
                alert("Dodano studenta "); self.getStudents(); self.hideStudent();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(textStatus + ': ' + errorThrown);
            }
        });
    };
    
    self.deleteStudent = function() { 
        var t = this;
        var ur = "http://localhost:8000/app/students/" + t.index();
        
        $.ajax({
            url: ur, 
            type: "DELETE", 
            success: function(result) { alert("usunieto studenta" ); self.getStudents(); }
        });
    };
    
    self.editStudent = function() {
        var t = this;
        var data = self.getStudentFromObject(ko.mapping.toJS(t));
        var dataJSON = JSON.stringify(data);
//        alert(dataJSON);
        var ur = "http://localhost:8000/app/students/" + t.index();
        $.ajax({
            contentType: "application/json",
            data: dataJSON, 
            url: ur, 
            type: "PUT",
            success: function() { alert("Edytowano studenta " + t.index()); self.getStudents(); },
            error: function(x, s, d ) { alert(s + ": " + d);}
        });
    };
    
    self.getCourses = function() {
            $.ajax({
            Accepts:"application/json",
            url: "http://localhost:8000/app/subjects"
        }).then(function(data) {
            self.subjects.removeAll();
            $.each(data, function() {
                self.subjects.push(ko.mapping.fromJS(this));
            });
                self.subjects.push(ko.mapping.fromJS(new course()));
        });
    };
    self.getCourses();
    
    self.deleteCourse = function() {
        var t = this;
        var ur = "http://localhost:8000/app/subjects/" + t.name();
        
        $.ajax({
            url: ur, 
            type: "DELETE", 
            success: function(result) { alert("usunieto kurs" ); self.getCourses(); }
        });
    };
    
    self.editCourse = function() {
        var t = this;
        var dataJSON = self.getCourseFromObject(ko.toJS(t));
        dataJSON = JSON.stringify(dataJSON);
        
        var ur = "http://localhost:8000/app/subjects/" + t.name();
        $.ajax({
            contentType: "application/json",
            data: dataJSON, 
            url: ur, 
            type: "PUT",
            success: function() { alert("Edytowano przedmiot " + t.name()); },
            error: function(x, s, d ) { alert(s + ": " + d);}
        });
    };
    
    self.addCourse = function() {
        var t = this;
        var dataJSON = self.subjects()[self.subjects().length - 1];
        var data = self.getCourseFromObject(dataJSON);
        dataJSON = ko.mapping.toJSON(data);
        var ur = "http://localhost:8000/app/subjects";
        $.ajax({
            contentType: "application/json; charset=utf-8",
            data: dataJSON, 
            url: ur, 
            type: "POST",
            success: function() { 
                alert("Dodano kurs "); self.getCourses(); self.hideCourse();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(textStatus + ': ' + errorThrown);
            }
        });
    };
    
    self.getGrades = function() {
        var t = this;
        var ur = "http://localhost:8000/app/students/" + t.index() + "/grades";
        self.currentGradeStudentIndex = t.index();
        $.ajax({
            Accepts:"application/json",
            url: ur
        }).then(function(data) {
            self.grades.removeAll();
            $.each(data, function() {
                var row = ko.mapping.toJS(ko.mapping.fromJS(this));
                row = self.getGradeFromObject(row);
                self.grades.push(row);
            });
                var tx = ko.mapping.fromJS(new grade());
                self.grades.push(tx);
        });
        
        return true;
    };
    
    self.getGradesWithIndex = function(index) {
        var ur = "http://localhost:8000/app/students/" + index + "/grades";
        self.currentGradeStudentIndex = index;
        $.ajax({
            Accepts:"application/json",
            url: ur
        }).then(function(data) {            
            self.grades.removeAll();
            $.each(data, function() {
                var row = ko.mapping.toJS(ko.mapping.fromJS(this));
                row = self.getGradeFromObject(row);
                self.grades.push(row);
            });
                self.grades.push(ko.mapping.fromJS(new grade()));
        });
        
        return true;
    };
    
    self.deleteGrade = function() {
        var t = this;
        var data = self.getGradeFromObject(ko.mapping.toJS(t));
        var dataJSON = ko.mapping.toJSON(data);
        var ur = "http://localhost:8000/app/students/" + self.currentGradeStudentIndex + "/grades/" + data.index;
        $.ajax({
            url: ur, 
            type: "DELETE", 
            success: function(result) { alert("usunieto ocene" ); self.getGradesWithIndex(self.currentGradeStudentIndex); }
        });
    };
    
    self.editGrade = function() {
        var t = this;
        var data = self.getGradeFromObject(ko.mapping.toJS(t));
        var dataJSON = ko.mapping.toJSON(data);
        var ur = "http://localhost:8000/app/subjects/" + self.currentGradeStudentIndex + "/grades/" + data.index;
        $.ajax({
            contentType: "application/json",
            data: dataJSON, 
            url: ur, 
            type: "PUT",
            success: function(result) { alert("edytowano ocene" ); self.getGradesWithIndex(self.currentGradeStudentIndex); },
            error: function(x, s, d ) { alert(s + ": " + d); }
        });
        
    };
    
    self.addGrade = function() {
        var t = this;
        var data = self.getGradeFromObject(ko.mapping.fromJS(t));
        var data = ko.mapping.toJS(data);
        var dataJSON = JSON.stringify(data);
//        alert(dataJSON);
        var ur = "http://localhost:8000/app/subjects/" + data.subject.name + "/grades";
//        alert(ur);
        $.ajax({
            contentType: "application/json; charset=utf-8",
            data: dataJSON,
            url: ur,
            type: "POST",
            success: function() {
                alert("Dodano ocene "); self.getGradesWithIndex(self.currentGradeStudentIndex); self.hideGrade();
            },
            error: function(a, textStatus, errorThrown) {
                alert(textStatus + ': ' + errorThrown);
            }
        });
    }
        
    self.hideStudent = function() {
        $('#studentsTable tbody tr:last-child').hide();
    }; 
    self.hideCourse = function() {
        $('#coursesTable tbody tr:last-child').hide();
    }; 
    
    self.hideGrade = function() {
        $('#studentsGradesTable tbody tr:last-child').hide();
    }; 
    
    self.studentsLastName.subscribe(function(value) {
        self.studentFilter.lastName = value;
        self.doFilterStudents(self.studentFilter);
});
    
    self.studentsName.subscribe(function(value) {
        self.studentFilter.name = value;
        self.doFilterStudents(self.studentFilter);
    });

    self.studentsIndex.subscribe(function(value) {
        self.studentFilter.index = value;
        self.doFilterStudents(self.studentFilter);
    });

    self.studentsBirthDate.subscribe(function(value) {
        self.studentFilter.equal = value;
        self.doFilterStudents(self.studentFilter);
    });

    self.doFilterStudents = function(studentsFilter){
        var query = $.param(self.studentFilter);
        var ur = "http://localhost:8000/app/students?" + query;
        $.ajax({
            Accepts:"application/json",
            url: ur,
            error: function(s, d, x) {
                alert(d + x );
            }
        }).then(function(data) {
            viewModel.students.removeAll();
            $.each(data, function() {
                self.students.push(ko.mapping.fromJS(this));
            });
                self.students.push(ko.mapping.fromJS(new student()));
        });
    };

    self.studentFilter = {
        index: "",
        name: "",
        lastName: "",
        equal: ""
    };
    
    self.gradesCourse.subscribe(function(value) {
        self.gradesFilter.course = value;
        self.doFilterGrades(self.gradesFilter);
    });

    self.gradesValue.subscribe(function(value) {
        self.gradesFilter.value = value;
        self.doFilterGrades(self.gradesFilter);
    });

    self.gradesDate.subscribe(function(value) {
        self.gradesFilter.date = value;
        self.doFilterGrades(self.gradesFilter);
    });

    self.gradesFilter = {
        course: "",
        date: "",
        value: ""
    };

    self.doFilterGrades = function(filter) {
        var query = $.param(filter);
        var ur = "http://localhost:8000/app/students/" + viewModel.currentGradeStudentIndex + "/grades?" + query;
        $.ajax({
            Accepts:"application/json",
            url: ur,
            error: function(s, d, x) {
                alert(d + x );
            }
        }).then(function(data) {
            viewModel.grades.removeAll();
            $.each(data, function() {
                viewModel.grades.push(ko.mapping.fromJS(this));
            });
                viewModel.grades.push(ko.mapping.fromJS(new grade()));
        });
    };
}

$('#studentAddButton').on('click', function() {
    $('#studentsTable tbody tr:last-child').show();
});

$('#courseAddButton').on('click', function() {
    $('#coursesTable tbody tr:last-child').show();
});

$('#gradeAddButton').on('click', function() {
    $('#studentsGradesTable tbody tr:last-child').show();
});

var viewModel = new ViewModel();
ko.applyBindings(viewModel);

