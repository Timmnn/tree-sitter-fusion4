/**
 * @file Fusion4 Parser
 * @author Timm Nicolaizik <timmmmnn@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'fusion4',

  extras: $ => [
    /\s/,
    $.comment,
  ],

  rules: {
    // Comments
    comment: $ => token(seq('//', /.*/)),

    // Program structure
    program: $ => seq(
      $.expression,
      repeat(seq(
        $._expression_separator,
        $.expression
      )),
      optional($._expression_separator)
    ),

    _expression_separator: $ => choice(
      /\n/,
      /\r\n/,
      ';'
    ),

    parameter_separator: $ => choice(
      /\n/,
      /\r\n/,
      ','
    ),

    // Block
    block: $ => seq(
      '{',
      optional($.expression),
      repeat(seq(
        $._expression_separator,
        $.expression
      )),
      optional($._expression_separator),
      '}'
    ),

    // Identifiers
    identifier: $ => token(seq(
      choice(
        seq(/[a-zA-Z*#~^$]/, repeat(/[a-zA-Z0-9_*#~^$]/)),
        seq(/[0-9]/, /[a-zA-Z*#~^$]/, repeat(/[a-zA-Z0-9_*#~^$]/)),
        seq('_', /[a-zA-Z*#~^$]/, repeat(/[a-zA-Z0-9_*#~^$]/))
      )
    )),

    // Expressions
    expression: $ => choice(
      $.reference,
      $.dereference,
      $.c_import,
      $.import_statement,
      $.function_definition,
      $.if_statement,
      $.string_literal,
      $.return_expression,
      $.while_loop,
      $.variable_declaration,
      $.struct_definition,
      $.boolean_expression,
      $.function_call,
      $.assignment,
      $.struct_field_access,
      $.float_literal,
      $.integer_literal,
      $.variable_access
    ),

    // References and dereferencing
    reference: $ => seq('&', $.expression),
    dereference: $ => seq('*', $.expression),

    // Arithmetic expressions
    add_expression: $ => prec.left(1, seq(
      $.multiply_expression,
      repeat(seq(
        choice('+', '-'),
        $.multiply_expression
      ))
    )),

    boolean_expression: $ => prec.left(2, seq(
      $.add_expression,
      repeat(seq(
        choice('==', '<'),
        $.add_expression
      ))
    )),

    multiply_expression: $ => prec.left(3, seq(
      $.primary,
      repeat(seq(
        choice('*', '/'),
        $.primary
      ))
    )),

    // Control flow
    while_loop: $ => seq('while', $.expression, $.block),
    if_statement: $ => seq('if', $.expression, $.block),

    // Import
    import_statement: $ => seq(
      'import',
      '{',
      $.identifier,
      repeat(seq(',', $.identifier)),
      '}',
      'from',
      $.string_literal
    ),

    // Variable access
    variable_access: $ => $.identifier,

    // Return
    return_expression: $ => seq('return', $.expression),

    // Primary expressions
    primary: $ => choice(
      $.float_literal,
      $.integer_literal,
      $.string_literal,
      $.function_call,
      $.struct_initialization,
      $.struct_field_access,
      $.block,
      $.variable_access,
      $.function_definition,
      seq('(', $.expression, ')')
    ),

    // Literals
    integer_literal: $ => token(seq(
      optional('-'),
      /[0-9]+/
    )),

    string_literal: $ => token(seq(
      '"',
      repeat(choice(
        /[^"\\]/,
        seq('\\', choice('"', '\\', '/', 'b', 'f', 'n', 'r', 't')),
        seq('\\u', /[0-9a-fA-F]{4}/)
      )),
      '"'
    )),

    float_literal: $ => token(seq(
      repeat(/[0-9]/),
      '.',
      /[0-9]+/
    )),

    // Functions
    function_definition: $ => seq(
      optional('pub'),
      'fn',
      $.identifier,
      optional($.generic_typing),
      '(',
      optional($.parameter_definition_list),
      ')',
      optional($.return_type),
      $.block
    ),

    generic_typing: $ => seq(
      '<',
      repeat1($.identifier),
      '>'
    ),

    return_type: $ => $.identifier,

    parameter_definition_list: $ => seq(
      $.field_definition,
      repeat(seq(',', $.field_definition))
    ),

    function_call: $ => seq(
      $.identifier,
      optional($.generic_parameters),
      '(',
      optional($.parameter_list),
      ')'
    ),

    generic_parameters: $ => seq(
      '<',
      $.identifier,
      repeat(seq(',', $.identifier)),
      '>'
    ),

    parameter_list: $ => seq(
      $.expression,
      repeat(seq(',', $.expression))
    ),

    // Structs
    struct_definition: $ => seq(
      'struct',
      $.identifier,
      '=',
      '{',
      optional($.struct_definition_content),
      '}'
    ),

    struct_definition_content: $ => seq(
      /\n/,
      $.field_definition,
      repeat(seq(
        choice(/\n/, ','),
        $.field_definition
      )),
      repeat(/\n/)
    ),

    field_identifier: $ => token(/[a-zA-Z0-9]+/),

    field_definition: $ => seq(
      $.field_identifier,
      ':',
      $.identifier
    ),

    struct_initialization: $ => seq(
      $.identifier,
      '{',
      repeat(/\n/),
      repeat($.struct_field_initialization),
      repeat(seq(
        $.parameter_separator,
        $.struct_field_initialization
      )),
      repeat(/\n/),
      '}'
    ),

    struct_field_initialization: $ => seq(
      $.identifier,
      ':',
      $.expression
    ),

    struct_field_access: $ => seq(
      $.identifier,
      '.',
      $.identifier
    ),

    // Type alias
    type_alias: $ => seq(
      'type',
      $.identifier,
      '=',
      $.identifier
    ),

    // Variable assignments
    assignment: $ => seq(
      $.identifier,
      '=',
      $.expression
    ),

    variable_declaration: $ => seq(
      $.identifier,
      ':=',
      $.expression,
      optional(seq('as', $.identifier))
    ),

    // C import
    c_import: $ => seq(
      '_c_import',
      $.string_literal,
      '(',
      repeat1(seq(
        $.identifier,
        ':',
        $.identifier
      )),
      ')'
    ),
  }
});
