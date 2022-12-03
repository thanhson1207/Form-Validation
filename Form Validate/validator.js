function Validator(options) {

    var selectorRules = {};


    function validate(inputElement, rule) {

        function getParent(element, selector) {
            while (element.parentElement) {
                if (element.parentElement.matches(selector) ) {
                    return element.parentElement;
                }
                element = element.parentElement;
            }
        }

        var errorMessage;
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)



        var rules = selectorRules[rule.selector];

        for (var i=0; i< rules.length; ++i) {

            switch (inputElement.type) {
                case 'ratio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default: 
                    errorMessage = rules[i](inputElement.value);

            }

            if(errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        }
        else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }

        return !errorMessage;
    }

    var formElement = document.querySelector(options.form)

    if (formElement) {

        formElement.onsubmit = function (e) {
            
            e.preventDefault();
            
            var isFormValid = true;

            
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate (inputElement, rule)    
            
                if (!isValid){
                    isFormValid = false;
                }
            });

            var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');

            var formValue = Array.from(enableInputs).reduce(function (values, input) {
                return (values[input.name] = input.value) && values;
            }, {});

            console.log(formValue)

            if (isFormValid) {
                if (typeof options.onSubmit === 'function') {

                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValue = Array.from(enableInputs).reduce(function (values, input) {
                        values[input.name] = input.value;
                        return values;
                    }, {});

                    options.onSubmit(formValue);
                } 
                else {
                    formElement.submit();
                }
            }
        }

        options.rules.forEach(function (rule) {
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }


            var inputElement = formElement.querySelector(rule.selector)

            if (inputElement) {

                inputElement.onblur = function () {
                    validate (inputElement, rule)
                }

                inputElement.oninput = function () {

                    var errorElement = inputElement.parentElement.querySelector(options.errorSelector)

                    errorElement.innerText = '';
                    inputElement.parentElement.classList.remove('invalid')
                }
            }

        })

    }
}

Validator.isRequire = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này !!'
        }
    };
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Vui lòng nhập lại Email !!'
        }
    };
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >=6 ? undefined : message || 'Vui lòng nhập tối thiểu 6 kí tự !!'
        }
    };
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị không hợp lệ, vui lòng nhập lại !!'
        }
    };
}

