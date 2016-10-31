define(['backbone','./Components', 'SelectorManager/model/Selectors', 'TraitManager/model/Traits'],
	function (Backbone, Components, Selectors, Traits) {

		return Backbone.Model.extend({

			defaults: {
				tagName: 'div',
				type: '',
				editable: false,
				removable: true,
				draggable: true,
				droppable: true,
				badgable: true,
				stylable: true,
				copyable: true,
				void: false,
				state: '',
				status: '',
				previousModel: '',
				content: '',
				style: {},
				attributes: {},
				traits: ['id', 'title'],
			},

			initialize: function(o, opt) {
				// Check void elements
				if(opt && opt.config && opt.config.voidElements.indexOf(this.get('tagName')) >= 0)
					this.set('void', true);

				this.sm = opt ? opt.sm || {} : {};
				this.config 	= o || {};
				this.defaultC = this.config.components || [];
				this.defaultCl = this.normalizeClasses(this.config.classes || []);
				this.components	= new Components(this.defaultC, opt);
				this.set('components', this.components);
				this.set('classes', new Selectors(this.defaultCl));
				var traits = new Traits();
				traits.setTarget(this);
				traits.add(this.get('traits'));
				this.set('traits', traits);
			},

			/**
			 * Normalize input classes from array to array of objects
			 * @param {Array} arr
			 * @return {Array}
			 * @private
			 */
			normalizeClasses: function(arr) {
				var res = [];

				if(!this.sm.get)
					return;

				var clm = this.sm.get('SelectorManager');
				if(!clm)
					return;

				arr.forEach(function(val){
					var name = '';

					if(typeof val === 'string')
						name = val;
					else
						name = val.name;

					var model = clm.add(name);
					res.push(model);
				});
				return res;
			},

			/**
			 * Override original clone method
			 * @private
			 */
	    clone: function() {
	    	var attr = _.clone(this.attributes),
	    			comp = this.get('components'),
						traits = this.get('traits'),
	    			cls = this.get('classes');
	    	attr.components = [];
	    	attr.classes = [];
				attr.traits = [];
	    	if(comp.length){
					comp.each(function(md,i) {
						attr.components[i]	= md.clone();
					});
	    	}
				if(traits.length){
					traits.each(function(md, i) {
						attr.traits[i] = md.clone();
					});
	    	}
	    	if(cls.length){
					cls.each(function(md,i) {
						attr.classes[i]	= md.get('name');
					});
	    	}
	    	attr.status = '';
	      return new this.constructor(attr, {sm: this.sm});
	    },

			/**
			 * Get name of the component
			 * @return {string}
			 * @private
			 * */
			getName: function() {
				if(!this.name){
					var id = this.cid.replace(/\D/g,''),
						type = this.get('type');
					var tag = this.get('tagName');
					tag = tag == 'div' ? 'box' : tag;
					tag = type ? type : tag;
					this.name 	= tag.charAt(0).toUpperCase() + tag.slice(1) + ' ' + id;
				}
				return this.name;
			},

			/**
			 * Return HTML string of the component
			 * @return {string} HTML string
			 * @private
			 */
			toHTML: function() {
				var code = '';
				var m = this;
				var tag = m.get('tagName'),
				attrs = m.get('attributes'),
				sTag = m.get('void'),
				attrId = '';
				// Build the string of attributes
				var attr = '';
				_.each(attrs, function(value, prop){
					// TODO: to refactor
					if(prop == 'onmousedown')
						return;
					attr += value && prop!='style' ? ' ' + prop + '="' + value + '"' : '';
				});
				// Build the string of classes
				var strCls = '';
				m.get('classes').each(function(m){
					strCls += ' ' + m.get('name');
				});
				strCls = strCls !== '' ? ' class="' + strCls.trim() + '"' : '';

				/*
				// TODO: to refactor
				if(m.get('type') == 'image'){
						tag = 'img';
						sTag	= 1;
						attr 	+= ' src="' + m.get('src') + '"';
				}
				*/
				 // If style is not empty I need an ID attached to the component
				 // TODO: need to refactor in case of 'ID Trait'
				 if(!_.isEmpty(m.get('style')))
 					attrId = ' id="' + m.cid + '" ';

				code += '<' + tag + strCls + attrId + attr + (sTag ? '/' : '') + '>' + m.get('content');

				var cln = m.get('components');
				if(cln.length)
					code += this.toHTML(cln);

				if(!sTag)
					code += '</'+tag+'>';

				return code;
			}

		}, {

			/**
			 * Detect if the passed element is a valid component.
			 * In case the element is valid an object abstracted
			 * from the element will be returned
			 * @param {HTMLElement}
			 * @return {Object}
			 * @private
			 */
			isValidEl: function(el) {
				var result = '';
				if(el.tagName == 'DIV')
					result = {tagName: 'div'};
				return result;
			}

		});
});
