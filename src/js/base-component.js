/**
 * @fileoverview Конструктор базовой DOM-компоненты
 * @author Irina Smirnova (Irkoman)
 */

'use strict';

var BaseComponent = function(el) {
  this.element = el;
};

BaseComponent.prototype = {
  show: function(parentNode) {
    parentNode.appendChild(this.element);
  },

  remove: function() {
    this.element.parentNode.removeChild(this.element);
  }
};

module.exports = BaseComponent;
