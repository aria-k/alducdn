Aldu.UI.Form = {
  validator : function(element) {
    $(element).autoload('jquery.tools', function(i, element) {
      $(element).validator({
        messageClass : 'validation-bubble',
        position : 'bottom left',
        offset : [
          12, 0
        ],
        message : '<div class="ui-state-error">'
          + '<em class="ui-state-error"></em>'
          + '<span class="ui-icon ui-icon-alert"></span></div>'
      });
    });
  },
  init : function(context) {
    Aldu.log('Aldu.UI.Form.init', 2);
    $('form', context).each(function(i, form) {
      if (!form.elements.length) {
        var container = $(form).parent();
        $('div.aldu-core-view-helper-html-form', container).remove();
        $(form).siblings().appendTo(form);
      }
      Aldu.CDN.require('jquery.tools', function() {
        $.tools.validator.fn('[data-equals]', Aldu.t("Value not equal with the $1 field."), function(input) {
          var id = input.data('equals');
          var field = $('#' + id);
          var name = field.siblings('label').text();
          var valid = input.val() == field.val();
          return valid ? true : [
            name
          ];
        });
        //Aldu.UI.Form.validator(form);
      });
      // Aldu\Media\Models\File
      $(form.elements).filter('input:file.aldu-core-view-helper-html-form-file').each(function(i, input) {
        $(input).on('change.ui.aldu', function(event) {
          var filename = event.target.value.replace("C:\\fakepath\\", "");
          $(input).alduphp('form.element', 'name').val(filename).trigger('change.ui.aldu');
          $(input).alduphp('form.element', 'description').focus();
        });
        $(input).alduphp('form.element', 'name').on('change.ui.aldu', function(event) {
          var filename = event.target.value.split('.');
          filename.pop();
          $(input).alduphp('form.element', 'title').val(filename.join('.').replace(/[-|_]/g, ' '));
        });
      });
      $(form.elements).filter('select').autoload('jquery.chosen', function(i, select) {
        $(select).chosen({
          'allow_single_deselect' : true
        });
      });
      $(form.elements).filter('input[data-fields]').autoload('jquery.tagit', function(i, input) {
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
              nin[field] = {
                '$nin' : input.value.split(',')
              };
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
      });
      $(form.elements).filter('textarea[data-editor="codemirror"]').autoload('codemirror', {
        modes : [
          'php', 'markdown'
        ],
        themes : [
          'eclipse', 'night', 'cobalt', 'monokai'
        ]
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
      $(form.elements).filter('textarea[data-editor=ckeditor]').autoload('ckeditor', { version : 'latest' }, function(i, textarea) {
        CKEDITOR.replace(textarea.id, {
          toolbar : 'Aldu',
          toolbar_Aldu : [
            {
              name : 'basicstyles',
              items : [
                'Bold', 'Italic', 'Underline', 'Strike', 'Subscript',
                'Superscript', '-', 'RemoveFormat'
              ]
            },
            {
              name : 'paragraph',
              items : [
                'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent',
                '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft',
                'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-',
                'BidiLtr', 'BidiRtl'
              ]
            }, {
              name : 'links',
              items : [
                'Link', 'Unlink', 'Anchor'
              ]
            }, {
              name : 'insert',
              items : [
                'Image', 'Table', '-', 'Source'
              ]
            }
          ],
          removePlugins : 'resize',
          extraPlugins : 'autogrow,codemirror',
          autoGrow_onStartup : true,
          forcePasteAsPlainText : true,
          basicEntities : false,
          entities : false,
          contentsCss : [
            'aldu.ui.base.css'
          ],
          ignoreEmptyParagraph : true,
          autoParagraph : true,
          filebrowserWindowWidth : 640,
          filebrowserWindowHeight : 480,
          filebrowserImageBrowseUrl : '/aldu/media/images?render=embed',
          filebrowserImageUploadUrl : '/aldu/media/image/add?render=embed'
        });
      });
    });
    $('fieldset', context).each(function(i, fieldset) {
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
      $('.aldu-core-view-helper-html-form-element', legend).click(function(event) {
        event.stopPropagation();
      });
      $(':checkbox, :radio', legend).change(function(event) {
        if ($(this).is(':not(:checked)')) {
          $(this).closest('fieldset').find(':checkbox').prop('checked',
            false);
        }
        if ($(this).is(':checked')) {
          $(fieldset).removeClass('collapsed');
          div.slideDown();
        }
      });
      $(':checkbox, :radio', fieldset).change(function(event) {
        if ($(this).is(':checked')) {
          $(fieldset).children('legend').find(':checkbox').prop(
            'checked', true);
        }
      });
      legend.click(function(event) {
        $(fieldset).toggleClass('collapsed');
        div.slideToggle();
      });
    });
    Aldu.UI.Form.datetime(context);
  },
  datetime : function(context) {
    $('input[type=date]', context).each(function(i, date) {
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
          clone.datepicker('setDate', new Date(this.value.replace(/ /, 'T')));
        }
      }
    });
  }
};
