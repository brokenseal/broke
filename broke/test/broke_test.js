$(function(){
	$('#start').click(function(){
		module("broke utils module");
		
		test("Expect broke.getRowSign to work properly", function() {
			equals( "even", broke.getRowSign(), "Expect return value to be even" );
			equals( "odd", broke.getRowSign(), "Expect return value to be odd" );
			equals( "even", broke.getRowSign(), "Expect return value to be even again" );
			equals( "odd", broke.getRowSign(), "Expect return value to be odd again" );
			equals( "pari", broke.getRowSign('pari'), "Expect return value to be even again" );
			equals( "dispari", broke.getRowSign(null, 'dispari'), "Expect return value to be odd again" );
		});
		
		test("Expect broke.keys to work properly", function() {
			same( ["maybe", "cool"], broke.keys({maybe: 'maybe', cool: true}), "Expect: 'maybe', 'cool'" );
		});
	});
});
