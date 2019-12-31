'use strict';

const $ = require('jquery');
let todoTemplate = require('../views/partials/todo.handlebars');


const KEY_ENTER = 13;
const KEY_ESCAPE = 27;


$(() => {
    let app = (() => {

        let $todoList = $('ul');

        const init = () => {
            registerEvents()
        };

        let registerEvents = function() {
            $todoList.on('change', 'li input:checkbox', updateTodoStatus);
            $todoList.on('keydown', 'li span', updateTodoText);
        };


        //Update Todos
        let getTodoLi = function(_this) {
            return $(_this).parent('li');
        }
        let getTodoData = function(_this) {
            let $li = getTodoLi(_this),
                id = $li.attr('id'),
                text = $li.children('span').text(),
                checked = $li.children('input').is(':checked');
            return {
                id: id,
                text: text,
                checked: checked
            };
        }
        let updateTodoLiAsChecked = function(_this) {
            getTodoLi(_this).toggleClass('checked');
        }
        let updateTodoStatus = function() {
            let todo = getTodoData(this);
            updateTodoAjax(todo.id, { completed: todo.checked }, function(data) {
                updateTodoLiAsChecked(this);
            }.bind(this));
        }
        let updateTodoText = function(event) {
            let todo = getTodoData(this),
                $this = $(this),
                key = event.keyCode,
                target = event.target;
            $this.addClass('editing');
            if (key === KEY_ESCAPE) {
                $this.removeClass('editing');
                document.execCommand('undo');
                target.blur();
            } else if (key === KEY_ENTER) {
                updateTodoAjax(todo.id, { task: todo.text }, function(data) {
                    $this.removeClass('editing');
                    target.blur();
                });
                event.preventDefault();
            }
        }
        let updateTodoAjax = function(id, data, cb) {
            $.ajax({
                url: '/' + id,
                type: 'PUT',
                data: data,
                dataType: 'json',
                success: function(data) {
                    cb(data);
                }
            });
        };


        return {
            init: init
        };

    })();

    app.init();

});

$(() => {

    /*==================================================================
    [ Focus input ]*/
    $('.input100').each(function() {
        $(this).on('blur', function() {
            if ($(this).val().trim() != "") {
                $(this).addClass('has-val');
                console.log('working1');
            } else {
                $(this).removeClass('has-val');
                console.log('working');
            }
        })
    })


    /*==================================================================
    [ Validate ]*/
    let input = $('.validate-input .input100');

    $('.validate-form').on('submit', function() {
        let check = true;

        for (let i = 0; i < input.length; i++) {
            if (validate(input[i]) == false) {
                showValidate(input[i]);
                check = false;
            }
        }

        return check;
    });


    $('.validate-form .input100').each(function() {
        $(this).focus(function() {
            hideValidate(this);
        });
    });

    function validate(input) {
        if ($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if ($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        } else {
            if ($(input).val().trim() == '') {
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }

});



window.setTimeout(() => {
    $(".alert").fadeTo(500, 0).slideUp(500, () => {
        $(this).remove();
    });
}, 1000);