import 'package:carousel_slider/carousel_controller.dart';
import 'package:carousel_slider/carousel_slider.dart';

import 'package:flutter/material.dart';

class DestinationCarousel extends StatefulWidget {
  @override
  _DestinationCarouselState createState() => _DestinationCarouselState();
}

class _DestinationCarouselState extends State<DestinationCarousel> {
  final String imagePath = 'assets/images/';

  final CarouselController _controller = CarouselController();

  List _isHovering = [false, false, false, false, false, false, false];
  List _isSelected = [true, false, false, false, false, false, false];

  int _current = 0;

  final List<String> images = [
    'assets/images/voucher3.png',
    'assets/images/voucher2.png',
    'assets/images/voucher3.png',
    'assets/images/voucher2.png',
    'assets/images/voucher3.png',
    'assets/images/voucher2.png',
  ];

 // final List<String> places = [
 //   'ASIA',
  //  'AFRICA',
 //   'EUROPE',
 //   'SOUTH AMERICA',
 //   'AUSTRALIA',
 //   'ANTARCTICA',
 // ];

  List<Widget> generateImageTiles(screenSize) {
    return images
        .map(
          (element) => ClipRRect(
        borderRadius: BorderRadius.circular(20.0),
        child: Image.asset(
          element,
          fit: BoxFit.cover,
        ),
      ),
    )
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    var screenSize = MediaQuery.of(context).size;
    var imageSliders = generateImageTiles(screenSize);

    return Container(
        padding: const EdgeInsets.only(top:50),
        color:Colors.white,

        child: Stack(
          children: [
            CarouselSlider(
              items: imageSliders,
              options: CarouselOptions(
                  enlargeCenterPage: true,
                  aspectRatio: 18/8,
                  onPageChanged: (index, reason) {
                    setState(() {
                      _current = index;

                    });
                  }),
              carouselController: _controller,
            ),


          ],
        )
    );

  }
}