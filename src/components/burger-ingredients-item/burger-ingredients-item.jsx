import React from 'react';
import PropTypes from 'prop-types';
import { useDrag } from "react-dnd";
import { useSelector } from 'react-redux';
import { CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import { useLocation, Link } from 'react-router-dom';
import styles from './burger-ingredients-item.module.css';
import ingredientType from "../../utils/ingridient.type";

function BurgerIngredientsItem(props) {
  const location = useLocation();
  const ingredients = useSelector(store => store.burger.constructorIngredients).filter(item => item._id === props.data._id);

  const [, dragRef] = useDrag({
    type: "ingredient",
    item: props.data
  });

  return (
    <li
      key={props.data._id}
      className="mb-8"
      ref={dragRef}
    >
      <Link
        to={{
          pathname: `/ingredients/${props.data._id}`,
          state: { background: location }
        }}
        className={styles.link}
      >
        {
          ingredients.length > 0 && (
            <span className={`${styles.count} text_type_digits-default`}>{ingredients.length}</span>
          )
        }
        <img src={props.data.image} alt=""/>
        <span className={`${styles.price} mt-2 mb-1 text_type_digits-default`}>
            {props.data.price}
          <CurrencyIcon type="primary" />
          </span>
        <p className={`${styles.name} text_type_main-default`}>{props.data.name}</p>
      </Link>
    </li>
  );
}

BurgerIngredientsItem.propTypes = {
  data: ingredientType.isRequired,
};

export default BurgerIngredientsItem;