<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * CardWorkout Entity
 *
 * @property int $id
 * @property int $card_id
 * @property int $workout_id
 * @property \Cake\I18n\Time $due_date
 * @property float $price
 * @property bool $used
 * @property string $created
 * @property string $modifed
 *
 * @property \App\Model\Entity\Card $card
 * @property \App\Model\Entity\Workout $workout
 */
class CardWorkout extends Entity
{

    /**
     * Fields that can be mass assigned using newEntity() or patchEntity().
     *
     * Note that when '*' is set to true, this allows all unspecified fields to
     * be mass assigned. For security purposes, it is advised to set '*' to false
     * (or remove it), and explicitly make individual fields accessible as needed.
     *
     * @var array
     */
    protected $_accessible = [
        '*' => true,
        'id' => false
    ];
}
