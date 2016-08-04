import Monkberry from 'monkberry';
import Template from './modal.monk';
import './modal.scss';

function undefToFalse( obj ){
    var keys = Object.keys( obj );
    for ( const key of keys ){
        if ( obj[key] === undefined ){
            obj[key] = false;
        }
    }

    return obj;
}

export default class extends Template {
    constructor() {
        super();

        // Define internal state of your compenent if you need to.
        this.state = {
            name: 'blah'
            ,isActive: false
        };

        // Add event listeners.
        this.on( 'click', '.close', this.show.bind(this, false) );
        this.on( 'click', '.modal-popup', ( e )=> {
            // close modal if click on background
            var bg = this.querySelector('.modal-popup');
            if ( bg === e.target ){
                this.show(false);
            }
        });
    }

    update( state ) {

        // Define actions to do on state updates.
        Object.assign(this.state, undefToFalse(state));

        // Call update of view itself.
        super.update(this.state);
        return this;
    }

    show( visibility = true, e ) {
        if ( e ){
            e.preventDefault();
        }
        this.update( { isActive: Boolean(visibility) });
        return this;
    }
}
;
