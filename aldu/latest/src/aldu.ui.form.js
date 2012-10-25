Aldu.UI.Form = {
  validator : function(element) {
    $(element).autoload(
      'jquery.tools',
      function(i, element) {
        $(element).validator(
          {
            //onBeforeFail : function(event, el) {},
            messageClass : 'validation-bubble',
            position : 'bottom left',
            offset : [ 12, 0 ],
            message : '<div class="ui-state-error">'
              + '<em class="ui-state-error"></em>'
              + '<span class="ui-icon ui-icon-alert"></span></div>'
          });
      });
  },
  init : function(context) {
    Aldu.UI.Form.combobox();
    $('form', context).autoload(
      'jquery.tools',
      function(i, form) {
        Aldu.log('Aldu.UI.Form.init', 2);
        if (!form.elements.length) {
          var container = $(form).parent();
          $('div.aldu-core-view-helper-html-form', container).remove();
          $(form).siblings().appendTo(form);
        }
        $.tools.validator.fn('[data-equals]', Aldu
          .t("Value not equal with the $1 field."), function(input) {
          var id = input.data('equals');
          var field = $('#' + id);
          var name = field.siblings('label').text();
          var valid = input.val() == field.val();
          return valid ? true : [ name ];
        });
        //Aldu.UI.Form.validator(form);
        $(form.elements).filter('select').autoload('jquery.chosen', function(i, select) {
          $(select).chosen({
            'allow_single_deselect' : true
          });
        });
        $(form.elements).filter('input[data-fields]').autoload('jquery.tagit',
          function(i, input) {
            var fields = $(input).data('fields').split(',');
            var labelField = $(input).data('label');
            var valueField = $(input).data('value');
            $(input).tagit({
              tagSource : function(request, response) {
                var $or = [];
                var $and = [];
                $.each(fields, function(i, field) {
                  var or = {};
                  var nin = {};
                  or[field] = '/^' + request.term + '/';
                  nin[field] = {'$nin' : input.value.split(',')};
                  $or.push(or);
                  $and.push(nin);
                });
                var search = {
                  '$or' : $or,
                  '$and' : $and
                };
                $.ajax({
                  'url' : $(input).data('source'),
                  'data' : {
                    'render' : 'json',
                    'search' : search
                  },
                  'success' : function(data) {
                    response($.map(data, function(model) {
                      return {
                        'value' : model[valueField]
                      };
                    }));
                  }
                });
              }
            });
          }
        );
        $(form.elements).filter('textarea[data-editor=codemirror]').autoload(
          'codemirror', {
            modes : [ 'php', 'markdown' ],
            themes : [ 'eclipse', 'night', 'cobalt', 'monokai' ]
          }, function(i, textarea) {
            var mode = $(textarea).data('mode') || 'text/x-markdown';
            var theme = $(textarea).data('theme') || 'eclipse';
            $(textarea).codemirror({
              mode : mode,
              lineNumbers : true,
              lineWrapping : true,
              readOnly : $(textarea).prop('readonly'),
              theme : theme
            });
          });
        $(form.elements).filter('textarea[data-editor=ckeditor]').autoload('ckeditor', function(i, textarea) {
          $(textarea).ckeditor({
            toolbar : 'Aldu',
            toolbar_Aldu : [ { name: 'basicstyles', items : [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat' ] },
                                 { name: 'paragraph', items : [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent' , '-', 'Blockquote', 'CreateDiv', '-',
                                                                'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl' ] },
                                 { name: 'links', items : [ 'Link', 'Unlink', 'Anchor' ] },
                                 { name: 'insert', items : [ 'Image', 'Table', '-', 'Source' ] } ],
            removePlugins : 'resize',
            extraPlugins : 'autogrow,codemirror',
            autoGrow_onStartup : true,
            forcePasteAsPlainText : true,
            basicEntities: false,
            entities : false,
            contentsCss : [ 'aldu.ui.base.css' ],
            ignoreEmptyParagraph: true,
            autoParagraph: true,
            filebrowserBrowseUrl : '/aldu/media/files',
          });
        });
        $('fieldset', context).each(
          function(i, fieldset) {
            var children = $(fieldset).children();
            var legend = $('legend', fieldset).first();
            legend.addClass('pointer');
            var div = $('<div></div>').append(children).appendTo(fieldset);
            $(fieldset).prepend(legend);
            if ($(fieldset).hasClass('collapsed')
              || $(fieldset).parents('fieldset').length) {
              $(fieldset).addClass('collapsed');
              div.hide();
            }
            $('.aldu-core-view-helper-html-form-element', legend).click(function(e) {
              e.stopPropagation();
            });
            $(':checkbox, :radio', legend).change(
              function(e) {
                if ($(this).is(':not(:checked)')) {
                  $(this).closest('fieldset').find(':checkbox').prop(
                    'checked', false);
                }
                if ($(this).is(':checked')) {
                  $(fieldset).removeClass('collapsed');
                  div.slideDown();
                }
              });
            $(':checkbox, :radio', fieldset).change(
              function() {
                if ($(this).is(':checked')) {
                  $(fieldset).children('legend').find(':checkbox').prop(
                    'checked', true);
                }
              });
            legend.click(function(e) {
              $(fieldset).toggleClass('collapsed');
              div.slideToggle();
            });
          });
      });
    Aldu.UI.Form.datetime(context);
  },
  datetime : function(context) {
    $('input[type=date]', context).each(
      function(i, date) {
        if (date.type !== 'date') {
          var clone = $(this).clone();
          clone.attr('id', '_' + clone.attr('id'));
          clone.removeAttr('name');
          clone.insertBefore(this);
          $(this).hide();
          var options = {
            altField : this,
            altFormat : 'yy-mm-dd',
            changeYear : true
          };
          clone.datepicker(options);
          if (clone.prop('required')) {
            clone.datepicker('setDate', new Date(this.value.replace(/ /,
              'T')));
          }
        }
      });
  },
  combobox : function() {
    if (!$.ui.combosearch) {
      $.widget("ui.combosearch", {
        _create : function() {
          var self = this;
          var orig = this.element.hide();
          var value = orig.val();
          var wrapper = this.wrapper = $("<span>").addClass("ui-combobox").insertAfter(orig);
          var required = this.element.prop('required');
          this.element.prop('required', false);
          var autofocus = this.element.prop('autofocus');
          var datalist = $('#' + this.element.data('list'));
          var fields = [];
          var inputs = {};
          var main = null;
          var others = {};
          datalist.children('option').each(function(i, option) {
            var field = $(option).val();
            fields[i] = $(option).text();
            inputs[field] = $("<input>").attr({
              'placeholder' : fields[i],
            }).appendTo(wrapper).val(value).addClass('ui-combobox-input ui-widget ui-widget-content');
            if (i === 0) {
              main = inputs[field];
              $(main).prop({
                'autofocus' : autofocus,
                'required' : required
              });
            }
            else {
              others[field] = inputs[field];
            }
          });
          main.autocomplete({
            minLength : 0,
            delay : 0,
            source : function(request, response) {
              var search = {};
              $.each(inputs, function(field, input) {
                search[field] = {'$regex' : $(input).val()};
              });
              $.ajax({
                'url' : orig.data('source'),
                'data' : {
                  'render' : 'json',
                  'search' : search
                },
                'success' : function(data) {
                  response($.map(data, function(model) {
                    return {
                      'value' : model.name,
                      'model' : model
                    };
                  }));
                }
              });
            },
            select : function(event, ui) {
              orig.val(ui.item.model.id);
              orig.trigger('change');
              $.each(inputs, function(field, input) {
                $(input).val(ui.item.model[field]);
              });
            }
          });
          main.data('autocomplete')._renderItem = function(ul, item) {
            var li = $("<li></li>").data("item.autocomplete", item).appendTo(ul);
            $.each(inputs, function(field, input) {
              var width = input.width();
              $("<a>" + item.model[field] + "</a>").width(width).css('display', 'inline-block').appendTo(li);
            });
            return li;
          };
          $.each(others, function(field, input) {
            input.on('keyup.ui.aldu', function(event) {
              switch (event.keyCode) {
              case 40:
                main.focus();
                break;
              default:
                main.autocomplete('search');
              }
            });
          });
          $("<a>").attr({
            tabIndex : -1,
            title : Aldu.t("Clear")
          })
          .appendTo(wrapper).button({
            icons : {
              primary : "ui-icon-cancel"
            },
            text : false
          }).removeClass("ui-corner-all").addClass(
            "ui-corner-right ui-combobox-toggle").click(function() {
              orig.val('');
              $.each(inputs, function(field, input) {
                $(input).val('');
              });
          });
        },
        destroy : function() {
          this.wrapper.remove();
          this.element.show();
          $.Widget.prototype.destroy.call(this);
        }
      });
    }
    if (!$.ui.combobox) {
      $.widget("ui.combobox", {
        _create : function() {
          var self = this;
          var select = this.element.hide();
          var selected = select.children(":selected");
          var value = selected.val() ? selected.text() : "";
          var wrapper = this.wrapper = $("<span>").addClass("ui-combobox").insertAfter(select);
          var required = this.element.prop('required');
          this.element.prop('required', false);
          var autofocus = this.element.prop('autofocus');
          var input = $("<input>").prop({
            'required' : required,
            'autofocus' : autofocus
          })
         .appendTo(wrapper)
         .val(value)
         .addClass("ui-combobox-input")
         .autocomplete(
              {
                autoFocus : autofocus,
                delay : 0,
                minLength : 0,
                source : function(request, response) {
                  if (source = select.data('source')) {
                    var field = select.data('field');
                    var search = {};
                    search[field] = {'$regex' : request.term};
                    $.ajax({
                      'url' : source,
                      'data' : {
                        'render' : 'json',
                        'search' : search,
                        'options' : {
                          'limit' : 5
                        }
                      },
                      success : function(data) {
                        response($.map(data, function(model) {
                          var option = $('<option>').attr({
                            value : model.id
                          }).text(model[field]);
                          return {
                            model : model,
                            value : model[field],
                            label : model[field],
                            option : option,
                            append : true
                          };
                        }));
                      }
                    });
                  }
                  else {
                    var matcher = new RegExp($.ui.autocomplete
                      .escapeRegex(request.term), "i");
                    response(select.children("option").map(
                      function() {
                        var text = $(this).text();
                        if (this.value
                          && (!request.term || matcher.test(text)))
                          return {
                            label : text.replace(new RegExp(
                              "(?![^&;]+;)(?!<[^<>]*)("
                                + $.ui.autocomplete
                                  .escapeRegex(request.term)
                                + ")(?![^<>]*>)(?![^&;]+;)", "gi"),
                              "<strong>$1</strong>"),
                            value : text,
                            option : this
                          };
                      }));
                  }
                },
                select : function(event, ui) {
                  if (ui.item.append) {
                    $(select).append(ui.item.option);
                  }
                  ui.item.option.selected = true;
                  self._trigger("selected", event, {
                    item : ui.item.option
                  });
                  select.trigger('change');
                },
                change : function(event, ui) {
                  if (!ui.item) {
                    var matcher = new RegExp("^"
                      + $.ui.autocomplete.escapeRegex($(this).val()) + "$",
                      "i");
                    var valid = false;
                    select.children("option").each(function() {
                      if ($(this).text().match(matcher)) {
                        this.selected = valid = true;
                        return false;
                      }
                    });
                    if (!valid) {
                      // TODO if invalid, add to the
                      // database or
                      if (url = select.data('add')) {
                        var text = $(this).val();
                        var add = $('<option>');
                        add.prop('selected', true);
                        add.attr({
                          value : text
                        }).text(text).appendTo(select);
                      }
                      // remove invalid value, as it
                      // didn't match
                      // anything
                      else {
                        $(this).val("");
                        select.val("");
                        input.data("autocomplete").term = "";
                      }
                      return false;
                    }
                  }
                }
              }).addClass("ui-widget ui-widget-content ui-corner-left");
          Aldu.UI.Form.validator(input);
          input.data("autocomplete")._renderItem = function(ul, item) {
            var anchor = $("<a>" + item.label + "</a>");
            var li = $("<li></li>").data("item.autocomplete", item).append(anchor).appendTo(ul);
            return li;
          };
          $("<a>").attr("tabIndex", -1).attr("title", "Show All Items")
            .appendTo(wrapper).button({
              icons : {
                primary : "ui-icon-triangle-1-s"
              },
              text : false
            }).removeClass("ui-corner-all").addClass(
              "ui-corner-right ui-combobox-toggle").click(function() {
              // close if already visible
              if (input.autocomplete("widget").is(":visible")) {
                input.autocomplete("close");
                return;
              }
              // work around a bug (likely same cause as
              // #5265)
              $(this).blur();
              // pass empty string as value to search for,
              // displaying
              // all
              // results
              input.autocomplete("search", "");
              input.focus();
            });
        },
        destroy : function() {
          this.wrapper.remove();
          this.element.show();
          $.Widget.prototype.destroy.call(this);
        }
      });
    }
  }
};
