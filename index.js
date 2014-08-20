/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    isShowingHidden: false,
    isShownHidden: false,
    isShowingDoor: false,
    isShownDoor : false,
    isShowingXYZ: false,
    isShownXYX: false,
    shouldShouldXYZ: false,

    showDoor : function(){
      console.log('app.isShowingDoor = ' + app.isShowingDoor);
      console.log('app.isShownDoor = ' + app.isShownDoor);
      if (!app.isShowingDoor && !app.isShownDoor){
        app.isShowingDoor = true;
        alert('Welcome to SHOP');
        app.isShownDoor = true;
      }
    },

    showXYZ: function(){
      console.log('app.isShowingXYZ = ' + app.isShowingXYZ);
      console.log('app.isShownXYZ = ' + app.isShownXYZ);
      if (!app.isShowingXYZ && app.isShownHidden && app.isShownDoor && app.shouldShouldXYZ){
        app.isShowingXYZ = true;
        alert('show QR code');
        $('#coupon').show();
      }
    },

    showHidden: function(){
      console.log('app.isShowingHidden = ' + app.isShowingHidden);
      console.log('app.isShownHidden = ' + app.isShownHidden);
      if (!app.isShowingHidden && app.isShownDoor){
        app.isShowingHidden = true;
        var ret = confirm('Beef deal?');
        app.dealAnswer = ret;
        if (ret){
          // Accepted the deal
          var url = '[TO CHECK-IN URL]';
          var data = {
            key : 'key-to-access-API-server'//
            , member_reg_id : 'the-user-id'//
            , beacon_uuid : 'the-uuid'
            , beacon_major : 0  // some major number
            , beacon_minor : 0  // some minor number
          };
          $.get(url, data, null, 'json')
          .done(function(d){
            alert('d' + JSON.stringify(d));
            app.timestamp = d.timestamp + 10;
            var clock = setInterval(function(){
              var url = '[TO POLLING URL]';
              console.log('polling = ' + url);

              $.get(url, null, null, 'json')
              .done(function(dd){
                alert('d = ' + JSON.stringify(dd));
                if (_.size(dd.records) > 0){
                  alert('Goto XYZ to meet your babe');
                  app.shouldShouldXYZ = true;
                  clearInterval(clock);
                }
              });

            }, 5000);
          })
          .fail();
        } else {

        }
        app.isShownHidden = true;
      }
    },

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    isDoor: function(b){
      return b.uuid == 'some-uuid' && b.major == 0 && b.minor == 0;
    },
    isHidden: function(b){
      return b.uuid == 'some-uuid' && b.major == 0 && b.minor == 0;   // hidden
    },
    isXYZ: function(b){
      return b.uuid == 'some-uuid' && b.major == 0 && b.minor == 0;   // XYZ
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //app.receivedEvent('deviceready');

        var lm = window.cordova.plugins.locationManager;

        var delegate = new lm.Delegate().implement({
  
          didDetermineStateForRegion: function (pluginResult) {
  
            console.log('[bbb][DOM] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));
  
            lm.appendToDeviceLog('[DOM] didDetermineStateForRegion: '
                                                              + JSON.stringify(pluginResult));
          },
  
          didStartMonitoringForRegion: function (pluginResult) {
            console.log('didStartMonitoringForRegion:', pluginResult);
  
            console.log('[bbb]didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
          },
  
          didRangeBeaconsInRegion: function (pluginResult) {
            console.log('[bbb] didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult, undefined, 2));
            var $beacons = $('#beacons');
            _.each(pluginResult.beacons, function(b){
              var id = [b.uuid, b.major, b.minor].join('-');
              var $div = $beacons.find('#' + id);
              var html = '<pre>' + id + ' = ' + b.rssi + '</pre>';
              if ($div.length == 0){
                html = '<div id="' + id +'">' + html + '</div>';
                $beacons.append(html);
              } else {
                $div.html(html)
              }

              if (app.isDoor(b) && b.rssi > -65){
                app.showDoor();
              } 
              if (app.isXYZ(b) && b.rssi > -65){
                app.showXYZ();
              } 
              if (app.isHidden(b) && b.rssi > -65){
                app.showHidden();
              }
            });
          },
          
          didEnterRegion: function(pluginResult){
            console.log('bbb] didEnterRegion: ' + JSON.stringify(pluginResult));
            console.log('bbb] didEnterRegion.region.rssi: ' + JSON.stringify(pluginResult.region.rssi));
            
          }

          , didExitRegion: function(pluginResult){
            console.log('[bbb] didExitRegion' + JSON.stringify(pluginResult));
          }
  
        });
        lm.setDelegate(delegate);

        var beacons = [
          new lm.BeaconRegion('beacon-identifier', 'some-uuid'),   // XYZ
        ];
        _.each(beacons, function(b){
          lm.startMonitoringForRegion(b)
          .fail(console.error)
          .done();

          lm.startRangingBeaconsInRegion(b)
          .fail(console.error)
          .done();
        });

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
}

