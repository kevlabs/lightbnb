$(() => {
  
  window.reservationForm = {};

  function create() {

    $reservationForm = $(`
      <div class="reservation-form__wrapper" style="position: fixed; z-index: 9999; width: 80vw; height: 30vh; top: 10vh; left: 10vw; padding: 20px; border: 1px solid #000; background: #EEE; opacity: 0.9">
        <button id="reservation-form__close" style="float: right;">[X]</button>
        <form action="/reservations" method="get" id="reservation-form" class="reservation-form">
          <input type="hidden" name="property_id">
          <div class="reservation-form__field-wrapper">
            <label for="reservation-form__start-date">Start Date</label>
            <input type="date" name="start_date" placeholder="" id="reservation-form__start-date">
            <label for="reservation-form__end-date">End Date</label>
            <input type="date" name="end_date" placeholder="" id="reservation-form__end-date">
          </div>
          <div class="reservation-form__field-wrapper">
            <button type="submit">Make a reservation</button>
          </div>
        </form>
      </div>
    `);

    this.$form = $reservationForm;

    $reservationForm.find('form').on('submit', function(event) {
      event.preventDefault();
      console.log('submit');
      const data = $(this).serialize();
      console.log(this);
      
      submitReservation(data)
      .then(() => {        
        window.reservationForm.detach();
      })
      .catch((error) => {
        console.error(error);
      })
  
    });
  
    $reservationForm.children('#reservation-form__close').on('click', this.detach);

    return $reservationForm;
  }

  function attach($container, propertyId) {
    $reservationForm = this.$form || this.create();
    $reservationForm.find('input[name="property_id"]').attr('value', propertyId);
    $reservationForm.appendTo($container)

  }
  function detach() {
    this.$form && this.$form.detach();
  }

  window.reservationForm.create = create.bind(window.reservationForm);
  window.reservationForm.attach = attach.bind(window.reservationForm);
  window.reservationForm.detach = detach.bind(window.reservationForm);

  // window.reservationForm = {
  //   create: create.bind(window.reservationForm),
  //   attach: attach.bind(this),
  //   detach: detach.bind(window.reservationForm)
  // };

});