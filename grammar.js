/**
 * @file Fusion4 Parser
 * @author Timm Nicolaizik <timmmmnn@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'fusion4',



  rules: {
    program: $ => repeat($.expression),
    expression: $ => choice($.identifier, $.if_stat),
    identifier: $ => /[a-zA-Z]+/,
    if_stat: $ => seq(token("if"), $.expression, $.block),
    block: $ => seq("{", repeat($.expression), "}")

  }
});
